package main

import (
	"database/sql"
	"strings"

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

type Selectable[T any] interface {
	ParamPtrList() []any
	ParamList() []string
	GetTableName() string
	*T
}

func Select[T any, PT Selectable[T]](where string) ([]T, error) {
	var obj T
	ptr := PT(&obj)

	db, err := sql.Open("sqlite3", DATABASE)
	if err != nil {
		return nil, err
	}

	query := "SELECT " + strings.Join(ptr.ParamList(), ", ")
	query += " FROM " + ptr.GetTableName()
	if where != "" {
		query += " WHERE " + where
	}

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}

	results := make([]T, 0, 0)
	for rows.Next() {
		var row T
		currPtr := PT(&row)
		if err := rows.Scan(currPtr.ParamPtrList()...); err != nil {
			return nil, err
		}

		results = append(results, row)
	}

	return results, nil
}
