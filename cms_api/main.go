package main

import (
	"context"
	"log"
	"net/http"
	"os"

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

	imageStore, err := initializeImageStore()
	if err != nil {
		log.Fatalln("There was an error while connecting to s3:", err.Error())
	}

	defer db.Disconnect(context.TODO())
	addRoutes(mux, db, imageStore)

	log.Println("Listening on:", ADDRESS)
	log.Println("Database:", os.Getenv("MONGODB_URI"))
	err = http.ListenAndServe(ADDRESS, mux)
	if err != nil {
		log.Fatalln("There was an error while serving:", err.Error())
	}
}
