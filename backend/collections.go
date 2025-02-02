package main

import (
	"database/sql"
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
	mux.HandleFunc("POST /collections", createCollection)

	mux.HandleFunc("/*", func(w http.ResponseWriter, r *http.Request) {
		WriteJSON(w, http.StatusNotFound, ResponseMessage{
			Status:  StatusCodeError,
			Message: fmt.Sprintf("Collection or action with path %q doesn't exist", r.URL.Path),
		})
	})

	return mux
}

func getCollections(w http.ResponseWriter, _ *http.Request) {
	w.Header().Add("Content-Type", "application/json")

	db, err := sql.Open("sqlite3", DATABASE)
	if err != nil {
		errorMessage := fmt.Sprintf("Error while getting collections: %v", err.Error())
		WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
			Status:  StatusCodeError,
			Message: errorMessage,
		})
		log.Println(errorMessage)
		return
	}

	rows, err := db.Query("SELECT * FROM collections")
	if err != nil {
		errorMessage := fmt.Sprintf("Error while getting collections: %v", err.Error())
		WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
			Status:  StatusCodeError,
			Message: errorMessage,
		})
		log.Println(errorMessage)
		return
	}

	data := make([]Collection, 0, 5)
	for rows.Next() {
		var collection Collection
		if err := rows.Scan(&collection.Id, &collection.CreatedAt, &collection.Name, &collection.Slug); err != nil {
			continue
		}

		data = append(data, collection)
	}

	WriteJSON(w, http.StatusOK, data)
}

type RequestBodyCreateCollection struct {
	Collection           Collection       `json:"collection"`
	CollectionAttributes []CollectionAttr `json:"attributes"`
}

func createCollection(w http.ResponseWriter, r *http.Request) {
	db, err := sql.Open("sqlite3", DATABASE)
	if err != nil {
		errorMessage := fmt.Sprintf("Error while getting collections: %v", err.Error())
		WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
			Status:  StatusCodeError,
			Message: errorMessage,
		})
		log.Println(errorMessage)
		return
	}

	if err == io.EOF {
		WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "No body was provided"})
		return
	}

	newCollection, misses, err := ReadBodyJSON[RequestBodyCreateCollection](r)
	if err != nil {
		response := ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax", Data: err.Error()}
		if len(misses) != 0 {
			response.Data = misses
		}

		WriteJSON(w, http.StatusBadRequest, response)
		log.Println("Error while creating new collection:", err)
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

	newCollection.Collection.CreatedAt = time.Now()

	res, err := db.Exec("INSERT INTO collections (createdAt, name, slug) VALUES (?, ?, ?)", newCollection.Collection.CreatedAt, newCollection.Collection.Name, newCollection.Collection.Slug)
	if err != nil {
		WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax: " + err.Error()})
		log.Println("Error while creating new collection:", err)
		return
	}

	id, err := res.LastInsertId()
	if err != nil {
		WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: err.Error()})
		log.Println("Error while creating new collection:", err)
		return
	}

	newCollection.Collection.Id = id
	for _, attr := range newCollection.CollectionAttributes {
		_, err = db.Exec("INSERT INTO collection_attributes VALUES (?, ?, ?)", newCollection.Collection.Id, attr.Name, attr.Type)
	}

	WriteJSON(w, http.StatusOK, newCollection)
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

func (request RequestBodyCreateCollection) Validate() Misses {
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
