package main

import (
	"database/sql"
	"errors"
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

type DBObject map[string]any

func Select(query string, args ...any) ([]DBObject, error) {
	db, err := sql.Open("sqlite3", DATABASE)
	if err != nil {
		return nil, err
	}

	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}

	columns, err := rows.Columns()
	if err != nil {
		return nil, err
	}

	results := make([]DBObject, 0, 0)
	for rows.Next() {
		row := make([]any, len(columns))

		for i := range row {
			row[i] = new(any)
		}

		if err := rows.Scan(row...); err != nil {
			return nil, err
		}

		result := make(DBObject, len(columns))
		for i, col := range columns {
			result[col] = *row[i].(*interface{})
		}
		results = append(results, result)
	}

	return results, nil
}

type Insertable interface {
	GetTableName() string
}

func Insert[T Insertable](entry T, fields map[string]any) (int64, error) {
	db, err := sql.Open("sqlite3", DATABASE)
	if err != nil {
		return -1, err
	}

	if len(fields) == 0 {
		return -1, errors.New("No data specified")
	}

	keys := make([]string, 0, len(fields))
	values := make([]any, 0, len(fields))
	for key, value := range fields {
		keys = append(keys, key)
		values = append(values, value)
	}

	query := "INSERT INTO " + entry.GetTableName()
	query += " ( " + strings.Join(keys, ", ") + " ) "
	query += "VALUES ( " + strings.Repeat("?, ", len(values)-1) + "?" + " )"
	res, err := db.Exec(query, values...)
	if err != nil {
		return -1, err
	}

	insertedId, _ := res.LastInsertId()
	return insertedId, nil
}
