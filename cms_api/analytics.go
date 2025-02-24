package main

import (
	"fmt"
	"net/http"
)

func handleAnalyticsRoutes() *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("/", test)

	return mux
}

func test(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Welcome aboard %q, let's see what we can identify from you...", r.RemoteAddr)
}
