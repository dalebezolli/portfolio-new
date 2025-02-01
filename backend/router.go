package main

import (
	"fmt"
	"net/http"
)

func addRoutes(mux *http.ServeMux) {
	mux.Handle("/v1/api/", http.StripPrefix("/v1/api", handleCollectionRoutes()))

	mux.HandleFunc("/*", func(w http.ResponseWriter, r *http.Request) {
		WriteJSON(w, http.StatusNotFound, ResponseMessage{
			Status:  StatusCodeError,
			Message: fmt.Sprintf("Request not found for %q", r.URL.Path),
		})
	})
}
