package main

import (
	"log"
	"net/http"
)

const (
	ADDRESS  string = ":9000"
	DATABASE string = "database.db"
)

func main() {
	mux := http.NewServeMux()

	err := initializeDB()
	if err != nil {
		log.Fatalln("There was an error while opening the database:", err.Error())
	}

	addRoutes(mux)

	log.Println("Listening on:", ADDRESS)
	err = http.ListenAndServe(ADDRESS, mux)
	if err != nil {
		log.Fatalln("There was an error while serving:", err.Error())
	}
}
