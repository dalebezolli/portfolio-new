package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	_ "github.com/mattn/go-sqlite3"
)

type StatusCode string

const (
	StatusCodeOk    = "ok"
	StatusCodeError = "error"
)

type ResponseMessage struct {
	Status  StatusCode `json:"status"`
	Message string     `json:"message"`
}

func WriteJSON[T any](w http.ResponseWriter, httpStatus int, data T) {
	w.Header().Add("Content-Type", "application/json")

	response, err := json.Marshal(data)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Fprintf(w, `{ "message": "Error while stringifying result: %v" }`, err.Error())
		log.Printf("Error while encode response data: %v", err.Error())
		return
	}

	w.WriteHeader(httpStatus)
	if _, err := w.Write(response); err != nil {
		log.Println("Error while sending response:", err)
	}
}

const (
	QUERY_CREATE_COLLECTIONS = `CREATE TABLE IF NOT EXISTS collections (
		id INTEGER PRIMARY KEY NOT NULL,
		createdAt DATETIME NOT NULL,
		slug STRING NOT NULL,
		basePath STRING NOT NULL
	);`
)

func initializeDB() error {
	db, err := sql.Open("sqlite3", DATABASE)
	if err != nil {
		return err
	}

	if _, err := db.Exec(QUERY_CREATE_COLLECTIONS); err != nil {
		return err
	}

	return nil
}
