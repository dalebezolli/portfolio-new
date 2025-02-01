package main

import (
	"log"
	"net/http"
)

const (
	ADDRESS string = ":9000"
)

func main() {
	log.Println("Listening on:", ADDRESS)
	err := http.ListenAndServe(ADDRESS, nil)
	if err != nil {
		log.Fatalln("There was an error while serving:", err.Error())
	}
}
