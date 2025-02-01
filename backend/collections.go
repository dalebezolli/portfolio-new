package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"time"
)

type Collection struct {
	Id        int
	CreatedAt time.Time
	Slug      string
	BasePath  string
}

func handleCollectionRoutes() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /collections", getCollections)

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
