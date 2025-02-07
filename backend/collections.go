package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
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
	collections, err := Select("SELECT * FROM collections")
	if err != nil {
		WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
			Status:  StatusCodeError,
			Message: err.Error(),
		})
		log.Println(err.Error())
		return
	}

	for _, row := range collections {
		collectionId := row["id"]
		attributes, err := Select("SELECT * FROM collection_attributes WHERE collection = ?", collectionId)
		if err != nil {
			log.Println("Error while getting attribute of collections getCollections:", err.Error())
		}

		row["attributes"] = attributes
	}

	WriteJSON(w, http.StatusOK, ResponseMessage{
		Status: StatusCodeOk,
		Data:   collections,
	})
}

func getCollectionSingle(w http.ResponseWriter, r *http.Request) {
	collectionId := r.PathValue("id")

	collection, err := Select("SELECT * FROM collections WHERE id = ?", collectionId)
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
			Status:  StatusCodeOk,
			Message: fmt.Sprintf("No collection with the specified id (%v)", collectionId),
		})
		return
	}
	attributes, err := Select("SELECT * FROM collection_attributes WHERE collection = ?", collectionId)
	if err != nil {
		log.Println("Error while getting attribute of collections getCollections:", err.Error())
	}

	collection[0]["attributes"] = attributes

	WriteJSON(w, http.StatusOK, ResponseMessage{
		Status: StatusCodeOk,
		Data:   collection[0],
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
	collectionId := r.PathValue("id")
	rows, err := Select("Select * FROM collections WHERE id = ?", collectionId)
	if err != nil {
		errorMessage := fmt.Sprintf("Error while updating collections: %v", err.Error())
		WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
			Status:  StatusCodeError,
			Message: errorMessage,
		})
		log.Println(errorMessage)
		return
	}

	if len(rows) == 0 {
		errorMessage := fmt.Sprintf("Error while updating collections: Entry with id (%v) doesn't exist", collectionId)
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

	if newData.Name != "" {
		rows[0]["name"] = newData.Name
	}

	if newData.Slug != "" {
		rows[0]["slug"] = newData.Slug
	}

	_, err = Update("UPDATE collections SET name = ?, slug = ? WHERE id = ?", rows[0]["name"], rows[0]["slug"], collectionId)
	if err != nil {
		response := ResponseMessage{Status: StatusCodeError, Message: err.Error()}

		WriteJSON(w, http.StatusBadRequest, response)
		log.Println("Error while updating collection:", err)
		return
	}

	WriteJSON(w, http.StatusOK, newData)
}

func deleteCollection(w http.ResponseWriter, r *http.Request) {
	collectionId := r.PathValue("id")
	rowsDeleted, err := Delete("DELETE FROM collections WHERE id = ?", collectionId)
	if err != nil {
		WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax: " + err.Error()})
		log.Println("Error while deleting collection:", err)
		return
	}

	_, err = Delete("DELETE FROM collection_attributes WHERE collection = ?", collectionId)
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
	attr, misses, err := ReadBodyJSON[CollectionAttr](r)
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

	collectionId := r.PathValue("id")
	rows, err := Select("SELECT * FROM collections WHERE id = ?", collectionId)
	if err != nil {
		errorMessage := fmt.Sprintf("Error while creating new collection attribute: %v", err.Error())
		WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
			Status:  StatusCodeError,
			Message: errorMessage,
		})
		log.Println(errorMessage)
		return
	}

	if len(rows) == 0 {
		errorMessage := fmt.Sprintf("Error while creating new collection attribute: Collection with id (%v) doesn't exist", collectionId)
		WriteJSON(w, http.StatusBadRequest, ResponseMessage{
			Status:  StatusCodeError,
			Message: errorMessage,
		})
		log.Println(errorMessage)
		return
	}

	_, err = Insert(attr, map[string]any{
		"collection": collectionId,
		"name":       attr.Name,
		"type":       attr.Type,
	})
	if err != nil {
		errorMessage := fmt.Sprintf("Error while inserting new collection attribute to db: %v", err.Error())
		WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
			Status:  StatusCodeError,
			Message: errorMessage,
		})
		log.Println(errorMessage)
		return
	}

	WriteJSON(w, http.StatusOK, attr)
}

func updateCollectionAttribute(w http.ResponseWriter, r *http.Request) {
	collectionId := r.PathValue("id")
	attributeName := r.PathValue("name")
	rows, err := Select("SELECT name, type FROM collection_attributes WHERE collection = ? AND name = ?", collectionId, attributeName)
	if err != nil {
		errorMessage := fmt.Sprintf("Error while updating collection attribute: %v", err.Error())
		WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
			Status:  StatusCodeError,
			Message: errorMessage,
		})
		log.Println(errorMessage)
		return
	}

	if len(rows) == 0 {
		errorMessage := fmt.Sprintf("Error while updating collections: Collection Attribute (%v) in collection (%v) doesn't exist", attributeName, collectionId)
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

	if newData.Name != "" {
		rows[0]["name"] = newData.Name
	}

	if newData.Type != "" {
		rows[0]["type"] = newData.Type
	}

	_, err = Update("UPDATE collection_attributes SET name = ?, type = ? WHERE collection = ? AND name = ?", rows[0]["name"], rows[0]["type"], collectionId, attributeName)
	if err != nil {
		response := ResponseMessage{Status: StatusCodeError, Message: err.Error()}

		WriteJSON(w, http.StatusBadRequest, response)
		log.Println("Error while updating collection attributes:", err)
		return
	}

	WriteJSON(w, http.StatusOK, rows[0])
}

func deleteCollectionAttribute(w http.ResponseWriter, r *http.Request) {
	rowsDeleted, err := Delete("DELETE FROM collection_attributes WHERE collection = ? AND name = ?", r.PathValue("id"), r.PathValue("name"))
	if err != nil {
		WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: err.Error()})
		log.Println("Error while deleting collection attrbute:", err)
		return
	}

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
