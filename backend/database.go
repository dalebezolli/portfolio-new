package main

import (
	"database/sql"
	_ "github.com/mattn/go-sqlite3"
)


const (
	QUERY_CREATE_COLLECTIONS = `CREATE TABLE IF NOT EXISTS collections (
		id INTEGER PRIMARY KEY,
		createdAt DATETIME NOT NULL,
		name STRING NOT NULL UNIQUE,
		slug STRING NOT NULL UNIQUE
	);`

	QUERY_CREATE_COLLECTION_ATTRS = `CREATE TABLE IF NOT EXISTS collection_attributes (
		collection INTEGER NOT NULL,
		name STRING NOT NULL,
		type STRING NOT NULL,
		PRIMARY KEY(name, collection),
		FOREIGN KEY(collection) REFERENCES collections(id)
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

	if _, err := db.Exec(QUERY_CREATE_COLLECTION_ATTRS); err != nil {
		return err
	}

	return nil
}
