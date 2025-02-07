package main

import (
	"database/sql"
	"fmt"
	"io"
	"log"
	"net/http"
	"strconv"
	"time"
)

type Collection struct {
	Id        int64     `json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
}

type CollectionAttr struct {
	Name string             `json:"name"`
	Type CollectionAttrType `json:"type"`
}

type CollectionWithAttrs struct {
	Collection           Collection       `json:"collection"`
	CollectionAttributes []CollectionAttr `json:"attributes"`
}

type CollectionAttrType string

const (
	CollectionAttrTypeString CollectionAttrType = "string"
	CollectionAttrTypeDate                      = "date"
	CollectionAttrTypeImage                     = "image"
	CollectionAttrTypeMDX                       = "mdx"
)

func handleCollectionRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /collections", getCollections)
	mux.HandleFunc("GET /collections/{id}", getCollectionSingle)
	mux.HandleFunc("POST /collections", createCollection)
	mux.HandleFunc("PUT /collections/{id}", updateCollection)
	mux.HandleFunc("DELETE /collections/{id}", deleteCollection)

	mux.HandleFunc("POST /collections/{id}/attributes", createCollectionAttribute)
	mux.HandleFunc("PUT /collections/{id}/attributes/{name}", updateCollectionAttribute)
	mux.HandleFunc("DELETE /collections/{id}/attributes/{name}", deleteCollectionAttribute)

	mux.HandleFunc("/*", func(w http.ResponseWriter, r *http.Request) {
		WriteJSON(w, http.StatusNotFound, ResponseMessage{
			Status:  StatusCodeError,
			Message: fmt.Sprintf("Collection or action with path %q doesn't exist", r.URL.Path),
		})
	})

	return mux
}

func getCollections(w http.ResponseWriter, _ *http.Request) {
	collections, err := Select[Collection]("")
	if err != nil {
		WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
			Status:  StatusCodeError,
			Message: err.Error(),
		})
		log.Println(err.Error())
		return
	}

	response := make([]CollectionWithAttrs, 0, 0)

	// Kinda inefficient but that's ok for now
	for _, row := range collections {
		attributes, err := Select[CollectionAttr]("collection = " + strconv.FormatInt(row.Id, 10))
		if err != nil {
			log.Println("Error while getting attribute of collections getCollections:", err.Error())
		}

		response = append(response, CollectionWithAttrs{Collection: row, CollectionAttributes: attributes})
	}

	WriteJSON(w, http.StatusOK, ResponseMessage{
		Status: StatusCodeOk,
		Data:   response,
	})
}

func getCollectionSingle(w http.ResponseWriter, r *http.Request) {
	collectionId := r.PathValue("id")

	collection, err := Select[Collection]("Id = " + collectionId)
	if err != nil {
		WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
			Status:  StatusCodeError,
			Message: err.Error(),
		})
		log.Println(err.Error())
		return
	}

	if len(collection) == 0 {
		WriteJSON(w, http.StatusOK, ResponseMessage{
			Status: StatusCodeOk,
		})
		return
	}

	attributes, err := Select[CollectionAttr]("collection = " + collectionId)
	if err != nil {
		log.Println("Error while getting attribute of collections getCollections:", err.Error())
	}

	response := CollectionWithAttrs{Collection: collection[0], CollectionAttributes: attributes}
	WriteJSON(w, http.StatusOK, ResponseMessage{
		Status: StatusCodeOk,
		Data:   response,
	})
}

func createCollection(w http.ResponseWriter, r *http.Request) {
	newCollection, misses, err := ReadBodyJSON[CollectionWithAttrs](r)
	if err == io.EOF {
		WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "No body was provided"})
		return
	}

	if err != nil {
		response := ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax", Data: err.Error()}
		if len(misses) != 0 {
			response.Data = misses
		}

		WriteJSON(w, http.StatusBadRequest, response)
		log.Println("Error while creating new collection:", err)
		return
	}

	newCollection.Collection.CreatedAt = time.Now()
	newCollectionId, err := Insert(newCollection.Collection, map[string]any{
		"name":      newCollection.Collection.Name,
		"slug":      newCollection.Collection.Slug,
		"createdAt": newCollection.Collection.CreatedAt,
	})
	if err != nil {
		WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax: " + err.Error()})
		log.Println("Error while creating new collection:", err)
		return
	}

	newCollection.Collection.Id = newCollectionId

	for _, attr := range newCollection.CollectionAttributes {
		_, err := Insert(attr, map[string]any{
			"collection": newCollectionId,
			"name":       attr.Name,
			"type":       attr.Type,
		})
		if err != nil {
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax: " + err.Error()})
			log.Println("Error while creating new collection attribute:", err)
			return
		}
	}

	WriteJSON(w, http.StatusOK, newCollection)
}

func updateCollection(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", DATABASE)
	if err != nil {
		errorMessage := fmt.Sprintf("Error while updating collections: %v", err.Error())
		WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
			Status:  StatusCodeError,
			Message: errorMessage,
		})
		log.Println(errorMessage)
		return
	}

	row := db.QueryRow("SELECT * FROM collections WHERE id = ?", r.PathValue("id"))
	var oldData Collection
	if err := row.Scan(&oldData.Id, &oldData.CreatedAt, &oldData.Name, &oldData.Slug); err != nil {
		errorMessage := fmt.Sprintf("Error while updating collections: %v", err.Error())
		WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
			Status:  StatusCodeError,
			Message: errorMessage,
		})
		log.Println(errorMessage)
		return
	}

	newData, misses, err := ReadBodyJSON[Collection](r)
	if err == io.EOF {
		WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "No body was provided"})
		return
	}

	if err != nil {
		response := ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax", Data: err.Error()}
		if len(misses) != 0 {
			response.Data = misses
		}

		WriteJSON(w, http.StatusBadRequest, response)
		log.Println("Error while updating collection:", err)
		return
	}

	_, err = db.Exec("UPDATE collections SET name = ?, slug = ? WHERE id = ?", newData.Name, newData.Slug, r.PathValue("id"))
	if err != nil {
		response := ResponseMessage{Status: StatusCodeError, Message: err.Error()}

		WriteJSON(w, http.StatusBadRequest, response)
		log.Println("Error while updating collection:", err)
		return
	}

	WriteJSON(w, http.StatusOK, newData)
}

func deleteCollection(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", DATABASE)
	if err != nil {
		errorMessage := fmt.Sprintf("Error while deleting collection: %v", err.Error())
		WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
			Status:  StatusCodeError,
			Message: errorMessage,
		})
		log.Println(errorMessage)
		return
	}

	res, err := db.Exec("DELETE FROM collections WHERE id = ?", r.PathValue("id"))
	if err != nil {
		WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax: " + err.Error()})
		log.Println("Error while deleting collection:", err)
		return
	}

	rowsDeleted, _ := res.RowsAffected()

	_, err = db.Exec("DELETE FROM collection_attributes WHERE collection = ?", r.PathValue("id"))
	if err != nil {
		WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: err.Error()})
		log.Println("Error while deleting collection:", err)
		return
	}

	response := fmt.Sprintf("Collection with id %q could not be found", r.PathValue("id"))
	if rowsDeleted != 0 {
		response = fmt.Sprintf("Collection with id %q deleted successfully", r.PathValue("id"))
	}

	WriteJSON(w, http.StatusOK, ResponseMessage{Status: StatusCodeOk, Message: response})
}

func createCollectionAttribute(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", DATABASE)
	if err != nil {
		errorMessage := fmt.Sprintf("Error while deleting collection: %v", err.Error())
		WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
			Status:  StatusCodeError,
			Message: errorMessage,
		})
		log.Println(errorMessage)
		return
	}

	attribute, misses, err := ReadBodyJSON[CollectionAttr](r)
	if err == io.EOF {
		WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "No body was provided"})
		return
	}

	if err != nil {
		response := ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax", Data: err.Error()}
		WriteJSON(w, http.StatusBadRequest, response)
		log.Println("Error while creating new collection attribute:", err)
		return
	}

	if len(misses) != 0 {
		response := ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax", Data: misses}
		if len(misses) != 0 {
			response.Data = misses
		}

		WriteJSON(w, http.StatusBadRequest, response)
		log.Println("Error while creating new collection:", misses)
		return
	}

	row := db.QueryRow("SELECT * FROM collections WHERE id = ?", r.PathValue("id"))
	var oldData Collection
	if err := row.Scan(&oldData.Id, &oldData.CreatedAt, &oldData.Name, &oldData.Slug); err != nil {
		errorMessage := fmt.Sprintf("Error while creating new collection attribute: %v", err.Error())
		WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
			Status:  StatusCodeError,
			Message: errorMessage,
		})
		log.Println(errorMessage)
		return
	}

	_, err = db.Exec("INSERT INTO collection_attributes VALUES (?, ?, ?)", r.PathValue("id"), attribute.Name, attribute.Type)
	if err != nil {
		errorMessage := fmt.Sprintf("Error while creating new collection attribute: %v", err.Error())
		WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
			Status:  StatusCodeError,
			Message: errorMessage,
		})
		log.Println(errorMessage)
		return
	}

	WriteJSON(w, http.StatusOK, attribute)
}

func updateCollectionAttribute(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", DATABASE)
	if err != nil {
		errorMessage := fmt.Sprintf("Error while updating collection attribute: %v", err.Error())
		WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
			Status:  StatusCodeError,
			Message: errorMessage,
		})
		log.Println(errorMessage)
		return
	}

	row := db.QueryRow("SELECT name, type FROM collection_attributes WHERE collection = ? AND name = ?", r.PathValue("id"), r.PathValue("name"))
	var oldData CollectionAttr
	if err := row.Scan(&oldData.Name, &oldData.Type); err != nil {
		errorMessage := fmt.Sprintf("Error while updating collection attribute: %v", err.Error())
		WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
			Status:  StatusCodeError,
			Message: errorMessage,
		})
		log.Println(errorMessage)
		return
	}

	newData, misses, err := ReadBodyJSON[CollectionAttr](r)
	if err == io.EOF {
		WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "No body was provided"})
		return
	}

	if err != nil {
		response := ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax", Data: err.Error()}
		if len(misses) != 0 {
			response.Data = misses
		}

		WriteJSON(w, http.StatusBadRequest, response)
		log.Println("Error while updating collection attribute:", err)
		return
	}

	_, err = db.Exec("UPDATE collection_attributes SET name = ?, type = ? WHERE collection = ? AND name = ?", newData.Name, newData.Type, r.PathValue("id"), r.PathValue("name"))
	if err != nil {
		response := ResponseMessage{Status: StatusCodeError, Message: err.Error()}

		WriteJSON(w, http.StatusBadRequest, response)
		log.Println("Error while updating collection attributes:", err)
		return
	}

	WriteJSON(w, http.StatusOK, newData)
}

func deleteCollectionAttribute(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", DATABASE)
	if err != nil {
		errorMessage := fmt.Sprintf("Error while deleting collection attribute: %v", err.Error())
		WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
			Status:  StatusCodeError,
			Message: errorMessage,
		})
		log.Println(errorMessage)
		return
	}

	res, err := db.Exec("DELETE FROM collection_attributes WHERE collection = ? AND name = ?", r.PathValue("id"), r.PathValue("name"))
	if err != nil {
		WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: err.Error()})
		log.Println("Error while deleting collection:", err)
		return
	}
	rowsDeleted, _ := res.RowsAffected()

	response := fmt.Sprintf("Collection attribute with name %q in collection %q could not be found", r.PathValue("name"), r.PathValue("id"))
	if rowsDeleted != 0 {
		response = fmt.Sprintf("Collection attribute with name %q in collection %q deleted successfully", r.PathValue("name"), r.PathValue("id"))
	}

	WriteJSON(w, http.StatusOK, ResponseMessage{Status: StatusCodeOk, Message: response})
}

func (c Collection) Validate() Misses {
	misses := make(Misses, 0)

	if c.Slug == "" {
		misses["slug"] = "slug cannot be empty"
	}

	if c.Name == "" {
		misses["name"] = "name cannot be empty"
	}

	return misses
}

func (c *Collection) ParamPtrList() []any {
	return []any{&c.Id, &c.CreatedAt, &c.Name, &c.Slug}
}

func (c Collection) ParamList() []string {
	return []string{"id", "createdAt", "name", "slug"}
}

func (c Collection) GetTableName() string {
	return "collections"
}

func (attr CollectionAttr) Validate() Misses {
	misses := make(Misses, 0)
	if attr.Type != CollectionAttrTypeString && attr.Type != CollectionAttrTypeImage && attr.Type != CollectionAttrTypeDate && attr.Type != CollectionAttrTypeMDX {
		misses["attributes."+attr.Name] = "Type \"" + string(attr.Type) + "\" is not one of the valid types"
	}

	return misses
}

func (attr *CollectionAttr) ParamPtrList() []any {
	return []any{&attr.Name, &attr.Type}
}

func (attr CollectionAttr) ParamList() []string {
	return []string{"name", "type"}
}

func (attr CollectionAttr) GetTableName() string {
	return "collection_attributes"
}

func (request CollectionWithAttrs) Validate() Misses {
	misses := request.Collection.Validate()

	for k, v := range misses {
		delete(misses, k)
		misses["collection."+k] = v
	}

	nameSet := make(map[string]bool)

	for _, attr := range request.CollectionAttributes {
		_, exists := nameSet[attr.Name]
		if exists {
			misses["attributes."+attr.Name] = "Names must be unique"
			continue
		}

		if attr.Type != CollectionAttrTypeString && attr.Type != CollectionAttrTypeImage && attr.Type != CollectionAttrTypeDate && attr.Type != CollectionAttrTypeMDX {
			misses["attributes."+attr.Name] = "Type \"" + string(attr.Type) + "\" is not one of the valid types"
		}

		nameSet[attr.Name] = true
	}

	return misses
}
