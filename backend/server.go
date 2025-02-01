package main

import (
	"database/sql"

	_ "github.com/mattn/go-sqlite3"
)

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
