package main

import (
	"fmt"
	"net/http"

	"go.mongodb.org/mongo-driver/v2/mongo"
)

func addRoutes(mux *http.ServeMux, db *mongo.Client) {
	mux.Handle("/v1/api/", http.StripPrefix("/v1/api", handleCollectionRoutes(db)))

	mux.HandleFunc("/*", func(w http.ResponseWriter, r *http.Request) {
		WriteJSON(w, http.StatusNotFound, ResponseMessage{
			Status:  StatusCodeError,
			Message: fmt.Sprintf("Request not found for %q", r.URL.Path),
		})
	})
}
