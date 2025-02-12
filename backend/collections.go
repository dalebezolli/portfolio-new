package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Collection map[string]any

type CollectionAttrType string

const (
	CollectionAttrTypeString CollectionAttrType = "string"
	CollectionAttrTypeDate   CollectionAttrType = "date"
	CollectionAttrTypeImage  CollectionAttrType = "image"
	CollectionAttrTypeMDX    CollectionAttrType = "mdx"
)

func handleCollectionRoutes(db *mongo.Client) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /collections", getCollections(db))
	mux.HandleFunc("GET /collections/{collection}", getCollectionSingle(db))
	mux.HandleFunc("POST /collections", createCollection(db))
	// WARN: Do we want to manage this in a more precise way?
	mux.HandleFunc("PUT /collections/{collection}", updateCollection(db))
	mux.HandleFunc("DELETE /collections/{collection}", deleteCollection(db))

	mux.HandleFunc("GET /{collection}", getData(db))
	mux.HandleFunc("GET /{collection}/{id}", getDataSingle(db))

	return mux
}

func getCollections(db *mongo.Client) http.HandlerFunc {
	cmsCollections := db.Database(CMS_DATABASE).Collection(CMS_COLLECTIONS)

	return func(w http.ResponseWriter, r *http.Request) {
		response, err := cmsCollections.Find(context.TODO(), bson.D{}, options.Find().SetProjection(publicProjection))
		if err != nil {
			WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
				Status:  StatusCodeError,
				Message: err.Error(),
			})
			log.Println(err.Error())
			return
		}

		results := []bson.M{}
		for response.Next(context.TODO()) {
			result := bson.M{}
			err = response.Decode(&result)
			if err != nil {
				WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
					Status:  StatusCodeError,
					Message: err.Error(),
				})
				log.Println(err.Error())
			}

			results = append(results, result)
		}

		WriteJSON(w, http.StatusOK, ResponseMessage{
			Status: StatusCodeOk,
			Data:   results,
		})
	}
}

func getCollectionSingle(db *mongo.Client) http.HandlerFunc {
	cmsCollections := db.Database(CMS_DATABASE).Collection(CMS_COLLECTIONS)

	return func(w http.ResponseWriter, r *http.Request) {
		collectionPath := r.PathValue("collection")
		result := cmsCollections.FindOne(context.TODO(), bson.M{"path": collectionPath})

		if result.Err() == mongo.ErrNoDocuments {
			WriteJSON(w, http.StatusOK, ResponseMessage{
				Status:  StatusCodeOk,
				Message: fmt.Sprintf("Failed to find collection with path (%v)", collectionPath),
			})
			return
		}

		collection := bson.M{}
		err := result.Decode(&collection)
		if err != nil {
			WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
				Status:  StatusCodeError,
				Message: err.Error(),
			})
			log.Println(err.Error())
			return
		}

		WriteJSON(w, http.StatusOK, ResponseMessage{
			Status: StatusCodeOk,
			Data:   collection,
		})
	}
}

func createCollection(db *mongo.Client) http.HandlerFunc {
	cmsDatabase := db.Database(CMS_DATABASE)
	cmsCollections := db.Database(CMS_DATABASE).Collection(CMS_COLLECTIONS)

	return func(w http.ResponseWriter, r *http.Request) {
		newCollection, misses, err := ReadBodyJSON[Collection](r)
		if err == io.EOF {
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "No body was provided"})
			return
		}

		if err != nil {
			response := ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax: " + err.Error()}
			WriteJSON(w, http.StatusBadRequest, response)
			log.Println("Error while creating new collection:", err)
			return
		}

		if len(misses) != 0 {
			response := ResponseMessage{Status: StatusCodeError, Message: fmt.Sprintf("Invalid Syntax: %v", misses)}
			WriteJSON(w, http.StatusBadRequest, response)
			log.Println("Error while creating new collection:", err)
			return
		}

		name, _ := (newCollection["name"]).(string)
		newCollection["path"] = StringToPath(name)
		newCollection["modifiedAt"] = time.Now()

		response, err := cmsCollections.InsertOne(context.TODO(), newCollection)
		if err != nil {
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax: " + err.Error()})
			log.Println("Error while creating new collection:", err)
			return
		}

		newCollection["_id"] = (response.InsertedID).(bson.ObjectID)

		err = cmsDatabase.CreateCollection(context.TODO(), (newCollection["path"]).(string))
		if err != nil {
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "Error while creating collection: " + err.Error()})
			log.Println("Error while creating new collection:", err)
			return
		}

		WriteJSON(w, http.StatusOK, ResponseMessage{Status: StatusCodeOk, Message: "Created collection successfully", Data: newCollection})
	}
}

func updateCollection(db *mongo.Client) http.HandlerFunc {
	cmsDatabase := db.Database("admin")
	cmsCollections := db.Database(CMS_DATABASE).Collection(CMS_COLLECTIONS)

	return func(w http.ResponseWriter, r *http.Request) {
		collectionPath := r.PathValue("collection")
		collectionChanges, misses, err := ReadBodyJSON[Collection](r)
		if err == io.EOF {
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "No body was provided"})
			return
		}

		if err != nil {
			response := ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax", Data: err.Error()}
			if len(misses) != 0 {
				response.Data = misses
			}

			WriteJSON(w, http.StatusBadRequest, response)
			log.Println("Error while updating collection:", err)
			return
		}

		if _, exists := collectionChanges["name"]; exists {
			newCollectionPath := StringToPath((collectionChanges["name"]).(string))
			collectionChanges["path"] = newCollectionPath

			renameResult := cmsDatabase.RunCommand(context.TODO(), bson.D{
				{Key: "renameCollection", Value: CMS_DATABASE + "." + collectionPath},
				{Key: "to", Value: CMS_DATABASE + "." + newCollectionPath},
			})

			if renameResult.Err() != nil {
				errorMessage := fmt.Sprintf("Error while updating collections: %v", renameResult.Err().Error())
				WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
					Status:  StatusCodeError,
					Message: errorMessage,
				})
				log.Println(errorMessage)
				return
			}
		}

		response, err := cmsCollections.UpdateOne(context.TODO(), bson.M{"path": collectionPath}, bson.M{"$set": collectionChanges})
		if err != nil {
			errorMessage := fmt.Sprintf("Error while updating collections: %v", err.Error())
			WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
				Status:  StatusCodeError,
				Message: errorMessage,
			})
			log.Println(errorMessage)
			return
		}

		message := fmt.Sprintf("Updated collection with path (%v)", collectionPath)
		if response.MatchedCount == 0 {
			message = fmt.Sprintf("Failed to find collection with path (%v)", collectionPath)
		}
		WriteJSON(w, http.StatusOK, ResponseMessage{
			Status:  StatusCodeOk,
			Message: message,
		})
	}
}

func deleteCollection(db *mongo.Client) http.HandlerFunc {
	cmsDatabase := db.Database(CMS_DATABASE)
	cmsCollections := db.Database(CMS_DATABASE).Collection(CMS_COLLECTIONS)

	return func(w http.ResponseWriter, r *http.Request) {
		collectionPath := r.PathValue("collection")
		result, err := cmsCollections.DeleteOne(context.TODO(), bson.M{"path": collectionPath})
		if err != nil {
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax: " + err.Error()})
			log.Println("Error while deleting collection:", err)
			return
		}

		message := fmt.Sprintf("Deleted document with path (%v) successfully", collectionPath)
		if result.DeletedCount == 0 {
			message = fmt.Sprintf("Failed to find document with path (%v)", collectionPath)
			cmsDatabase.Collection(collectionPath).Drop(context.TODO())
		}

		WriteJSON(w, http.StatusOK, ResponseMessage{Status: StatusCodeOk, Message: message})
	}
}

func getData(db *mongo.Client) http.HandlerFunc {
	cmsDatabase := db.Database(CMS_DATABASE)

	return func(w http.ResponseWriter, r *http.Request) {
		collectionPath := r.PathValue("collection")

		list, err := cmsDatabase.ListCollectionNames(context.TODO(), bson.M{"name": collectionPath})
		if err != nil {
			message := fmt.Sprintf("Error while getting data from collection (%v): %v", collectionPath, err.Error())
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: message})
			log.Println(message)
			return
		}

		if len(list) == 0 {
			message := fmt.Sprintf("Couldn't find collection (%v)", collectionPath)
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: message})
			return
		}

		cmsCollectionData := db.Database(CMS_DATABASE).Collection(collectionPath)
		response, err := cmsCollectionData.Find(context.TODO(), bson.D{})
		if err != nil {
			message := fmt.Sprintf("Error while getting data from collection (%v): %v", collectionPath, err.Error())
			WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
				Status:  StatusCodeError,
				Message: message,
			})
			log.Println(message)
			return
		}

		results := []bson.M{}
		for response.Next(context.TODO()) {
			result := bson.M{}
			err = response.Decode(&result)
			if err != nil && (mongo.IsNetworkError(err) || mongo.IsTimeout(err)) {
				message := fmt.Sprintf("Error while searching for entries in collection (%v): %v", collectionPath, err.Error())
				WriteJSON(w, http.StatusInternalServerError, ResponseMessage{Status: StatusCodeError, Message: message})
				log.Println(message)
				return
			}

			results = append(results, result)
		}

		WriteJSON(w, http.StatusOK, ResponseMessage{
			Status: StatusCodeOk,
			Data:   results,
		})
	}
}

func getDataSingle(db *mongo.Client) http.HandlerFunc {
	cmsDatabase := db.Database(CMS_DATABASE)

	return func(w http.ResponseWriter, r *http.Request) {
		collectionPath := r.PathValue("collection")

		list, err := cmsDatabase.ListCollectionNames(context.TODO(), bson.M{"name": collectionPath})
		if err != nil {
			message := fmt.Sprintf("Error while getting data from collection (%v): %v", collectionPath, err.Error())
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: message})
			log.Println(message)
			return
		}

		if len(list) == 0 {
			message := fmt.Sprintf("Couldn't find collection (%v)", collectionPath)
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: message})
			return
		}

		cmsCollectionData := db.Database(CMS_DATABASE).Collection(collectionPath)
		dataHexId := r.PathValue("id")
		dataObjectId, err := bson.ObjectIDFromHex(dataHexId)
		if err != nil {
			message := fmt.Sprintf("Error while searching for (%v) in collection (%v): %v", dataHexId, collectionPath, err.Error())
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: message})
			log.Println(message)
			return
		}

		response := cmsCollectionData.FindOne(context.TODO(), bson.M{"_id": dataObjectId})
		result := bson.M{}
		err = response.Decode(&result)
		if err != nil && (mongo.IsNetworkError(err) || mongo.IsTimeout(err)) {
			message := fmt.Sprintf("Error while searching for (%v) in collection (%v): %v", dataHexId, collectionPath, err.Error())
			WriteJSON(w, http.StatusInternalServerError, ResponseMessage{Status: StatusCodeError, Message: message})
			log.Println(message)
			return
		}

		status := StatusCodeOk
		message := ""
		if id, exists := result["_id"]; exists == false || len((id).(string)) == 0 {
			status = StatusCodeError
			message = fmt.Sprintf("Couldn't find (%v) in collection (%v)", dataHexId, collectionPath)
		}

		WriteJSON(w, http.StatusOK, ResponseMessage{
			Status:  status,
			Message: message,
			Data:    result,
		})
	}
}

var publicProjection = bson.M{
	"_id":        false,
	"createdAt":  bson.M{"$toDate": "$_id"},
	"modifiedAt": true,
	"name":       true,
	"path":       true,
	"attributes": true,
}

func (c Collection) Validate() Misses {
	return nil
}

type CollectionData map[string]any

func (d CollectionData) Validate() Misses {
	return nil
}
