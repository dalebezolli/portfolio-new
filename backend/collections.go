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
	Id        int       `json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	Slug      string    `json:"slug"`
	BasePath  string    `json:"basePath"`
}

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
		if err := rows.Scan(&collection.Id, &collection.CreatedAt, &collection.Slug, &collection.BasePath); err != nil {
			continue
		}

		data = append(data, collection)
	}

	WriteJSON(w, http.StatusOK, data)
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
		WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "Expected {slug: string, basePath: string}"})
		return
	}

	var bodyString string
	_, err = fmt.Fscan(r.Body, &bodyString)
	if err != nil {
		fmt.Println("Error while reading body:", err.Error())
		return
	}

	newCollection, err := ReadJSON[Collection](bodyString)
	if err != nil {
		WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "Expected {slug: string, basePath: string}"})
		log.Println("Error while parsing body:", err)
		return
	}

	newCollection.CreatedAt = time.Now()

	_, err = db.Exec("INSERT INTO collections (createdAt, slug, basePath) VALUES (?, ?, ?)", newCollection.CreatedAt, newCollection.Slug, newCollection.BasePath)
	if err != nil {
		WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "Expected {slug: string, basePath: string}"})
		log.Println("Error while parsing body:", err)
		return
	}

	fmt.Println("Response:", newCollection)
}
