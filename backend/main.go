package main

import (
	"context"
	"log"
	"net/http"

	"github.com/joho/godotenv"
)

const (
	ADDRESS  string = ":9000"
	DATABASE string = "database.db"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatalln("No .env file found.")
	}

	mux := http.NewServeMux()

	db, err := initializeDB()
	if err != nil {
		log.Fatalln("There was an error while opening the database:", err.Error())
	}

	defer db.Disconnect(context.TODO())
	addRoutes(mux, db)

	log.Println("Listening on:", ADDRESS)
	err = http.ListenAndServe(ADDRESS, mux)
	if err != nil {
		log.Fatalln("There was an error while serving:", err.Error())
	}
}
