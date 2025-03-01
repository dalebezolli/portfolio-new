package main

import (
	"fmt"
	"net/http"

	"go.mongodb.org/mongo-driver/v2/mongo"
)

func addRoutes(mux *http.ServeMux, db *mongo.Client, imageStore *ImageStore) {
	mux.Handle("/v1/api/", http.StripPrefix("/v1/api", handleCollectionRoutes(db, imageStore)))
	mux.Handle("/v1/api/analytics/", http.StripPrefix("/v1/api/analytics", handleAnalyticsRoutes(db)))

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		WriteJSON(w, http.StatusNotFound, ResponseMessage{
			Status:  StatusCodeError,
			Message: fmt.Sprintf("Request not found for %q", r.URL.Path),
		})
	})
}
