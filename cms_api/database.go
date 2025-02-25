package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"maps"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

const CMS_DATABASE = "portfolio-cms"
const CMS_C_COLLECTIONS = "collections"
const CMS_C_ANALYTICS_USERS = "analytics_users"

const db_max_request_timeout = 10*time.Second

func initializeDB() (*mongo.Client, error) {
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		return nil, errors.New("No MongoDB connection URI found. Set the 'MONGODB_URI' environment variable.")
	}
	
	client, err := mongo.Connect(options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	createDBCollection(client.Database(CMS_DATABASE), CMS_C_COLLECTIONS)
	createDBCollection(client.Database(CMS_DATABASE), CMS_C_ANALYTICS_USERS)

	return client, nil
}

func getDBResource(
	db *mongo.Database,
	collection string,
	filter interface{},
	opts ...options.Lister[options.FindOptions],
) ([]map[string]interface{}, error) {
	context, cancel := context.WithTimeout(context.Background(), db_max_request_timeout)
	defer cancel()

	err := checkCollectionExistence(db, collection)
	if err != nil {
		return nil, err
	}

	response, err := db.Collection(collection).Find(context, filter, opts...)
	if err != nil {
		return nil, err
	}

	results := make([]map[string]interface{}, 0)
	for response.Next(context) {
		result := make(map[string]interface{})
		err = response.Decode(&result)
		if err != nil {
			return nil, err
		}

		results = append(results, result)
	}

	log.Printf("Total collected resources for %q: %v", collection, results)
	return results, nil
}

func createDBResource(
	db *mongo.Database,
	collection string,
	document map[string]any,
	opts ...options.Lister[options.InsertOneOptions],
) (map[string]interface{}, error) {
	err := checkCollectionExistence(db, collection)
	if err != nil {
		return nil, err
	}

	var orderedCollection bson.D
	stringifiedCollection, err := json.Marshal(document)
	err = bson.UnmarshalExtJSON(stringifiedCollection, true, &orderedCollection)
	if err != nil {
		return nil, err
	}

	context, cancel := context.WithTimeout(context.Background(), db_max_request_timeout)
	defer cancel()

	result, err := db.Collection(collection).InsertOne(context, document, opts...)
	if err != nil {
		return nil, err
	}

	// TODO: Consider either deep cloning or getting a new entry from the database if this is used in the future
	databaseCollection := maps.Clone(document)
	databaseCollection["_id"] = result.InsertedID


	log.Printf("Inserted resource in %q: %v", collection, databaseCollection)
	return databaseCollection, nil
}

func updateDBResource(
	db *mongo.Database,
	collection string,
	filter interface{},
	update interface{},
	opts ...options.Lister[options.UpdateOneOptions],
) (map[string]interface{}, error) {
	context, cancel := context.WithTimeout(context.Background(), db_max_request_timeout)
	defer cancel()

	err := checkCollectionExistence(db, collection)
	if err != nil {
		return nil, err
	}

	record, err := getDBResource(db, collection, filter)
	if err != nil {
		return nil, err
	}

	if len(record) == 0 {
		return nil, errors.New("Updated record cannot be shown")
	}

	response, err := db.Collection(collection).UpdateByID(context, record[0]["_id"], update, opts...)
	if err != nil {
		return nil, err
	}

	if response.ModifiedCount == 0 {
		return nil, errors.New("No record was updated")
	}


	newRecord, err := getDBResource(db, collection, filter)
	if err != nil {
		return nil, err
	}

	if len(newRecord) == 0 {
		return nil, errors.New("Updated record cannot be shown")
	}

	log.Printf("Updated resource in %q: %v %v", collection, record, newRecord)
	return newRecord[0], nil
}

func deleteDBResource(
	db *mongo.Database,
	collection string,
	filter interface{},
	opts ...options.Lister[options.DeleteOneOptions],
) error {
	context, cancel := context.WithTimeout(context.Background(), db_max_request_timeout)
	defer cancel()

	err := checkCollectionExistence(db, collection)
	if err != nil {
		return err
	}

	result, err := db.Collection(collection).DeleteOne(context, filter, opts...)
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return errors.New("No record was deleted")
	}

	log.Printf("Deleted resource in %q: %v", collection, filter)
	return nil
}

func createDBCollection(db *mongo.Database, collection string) error {
	context, cancel := context.WithTimeout(context.Background(), db_max_request_timeout)
	defer cancel()

	err := db.CreateCollection(context, collection)
	return err
}

func renameDBCollection(
	db *mongo.Database,
	database,
	oldCollection,
	newCollection string,
) error {
	context, cancel := context.WithTimeout(context.Background(), db_max_request_timeout)
	defer cancel()

	renameResult := db.RunCommand(context, bson.D{
		{Key: "renameCollection", Value: database + "." + oldCollection},
		{Key: "to", Value: database + "." + newCollection},
	})

	return renameResult.Err()
}

func deleteDBCollection(
	db *mongo.Database,
	collection string,
) error {
	context, cancel := context.WithTimeout(context.Background(), db_max_request_timeout)
	defer cancel()

	return db.Collection(collection).Drop(context)
}

func checkCollectionExistence(
	db *mongo.Database,
	collection string,
) error {
	context, cancel := context.WithTimeout(context.Background(), db_max_request_timeout)
	defer cancel()

	list, err := db.ListCollectionNames(context, bson.M{"name": collection})
	if err != nil {
		return errors.New(fmt.Sprintf("Error while getting data from collection (%v): %v", collection, err.Error()))
	}

	if len(list) == 0 {
		return errors.New(fmt.Sprintf("Couldn't find collection (%v)", collection))
	}

	return nil
}
