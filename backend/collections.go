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
)

type Collection struct {
	Id         bson.ObjectID `json:"_id"`
	ModifiedAt time.Time     `json:"modifiedAt"`

	Name string `json:"name"`
	Path string `json:"path"`

	Attributes []CollectionAttr `json:"attributes"`
}

type CollectionAttr struct {
	Name string             `json:"name"`
	Type CollectionAttrType `json:"type"`
}

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
	mux.HandleFunc("GET /collections/{id}", getCollectionSingle(db))
	mux.HandleFunc("POST /collections", createCollection(db))
	// WARN: Do we want to manage this in a more precise way?
	mux.HandleFunc("PUT /collections/{id}", updateCollection(db))
	mux.HandleFunc("DELETE /collections/{id}", deleteCollection(db))

	mux.HandleFunc("/*", func(w http.ResponseWriter, r *http.Request) {
		WriteJSON(w, http.StatusNotFound, ResponseMessage{
			Status:  StatusCodeError,
			Message: fmt.Sprintf("Collection or action with path %q doesn't exist", r.URL.Path),
		})
	})

	return mux
}

func getCollections(db *mongo.Client) http.HandlerFunc {
	cmsCollections := db.Database(CMS_DATABASE).Collection(CMS_COLLECTIONS)

	return func(w http.ResponseWriter, r *http.Request) {
		response, err := cmsCollections.Find(context.TODO(), bson.D{})
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
		collectionId, err := bson.ObjectIDFromHex(r.PathValue("id"))
		if err != nil {
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "Bad Id: " + err.Error()})
			log.Println("Error while selecting single collection:", err)
			return
		}

		result := cmsCollections.FindOne(context.TODO(), bson.M{"_id": collectionId})

		if result.Err() == mongo.ErrNoDocuments {
			WriteJSON(w, http.StatusOK, ResponseMessage{
				Status:  StatusCodeOk,
				Message: fmt.Sprintf("Failed to find collection with id (%v)", collectionId),
			})
			return
		}

		collection := bson.M{}
		err = result.Decode(&collection)
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
	cmsCollections := db.Database(CMS_DATABASE).Collection(CMS_COLLECTIONS)

	return func(w http.ResponseWriter, r *http.Request) {
		newCollection, misses, err := ReadBodyJSON[Collection](r)
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
			log.Println("Error while creating new collection:", err)
			return
		}

		newCollection.ModifiedAt = time.Now()
		response, err := cmsCollections.InsertOne(context.TODO(), newCollection)
		if err != nil {
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax: " + err.Error()})
			log.Println("Error while creating new collection:", err)
			return
		}

		newCollection.Id = (response.InsertedID).(bson.ObjectID)

		WriteJSON(w, http.StatusOK, newCollection)
	}
}

func updateCollection(db *mongo.Client) http.HandlerFunc {
	cmsCollections := db.Database(CMS_DATABASE).Collection(CMS_COLLECTIONS)

	return func(w http.ResponseWriter, r *http.Request) {
		collectionId, err := bson.ObjectIDFromHex(r.PathValue("id"))
		if err != nil {
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "Bad Id: " + err.Error()})
			log.Println("Error while updating collection:", err)
			return
		}

		newData, misses, err := ReadBodyJSON[Collection](r)
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

		changes := bson.M{}
		if newData.Name != "" {
			changes["name"] = newData.Name
		}

		if newData.Path != "" {
			changes["path"] = newData.Path
		}

		changes["attributes"] = newData.Attributes

		response, err := cmsCollections.UpdateByID(context.TODO(), collectionId, bson.M{"$set": changes})
		if err != nil {
			errorMessage := fmt.Sprintf("Error while updating collections: %v", err.Error())
			WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
				Status:  StatusCodeError,
				Message: errorMessage,
			})
			log.Println(errorMessage)
			return
		}

		message := fmt.Sprintf("Updated collection with id (%v)", collectionId)
		if response.MatchedCount == 0 {
			message = fmt.Sprintf("Failed to find collection with id (%v)", collectionId)
		}

		WriteJSON(w, http.StatusOK, ResponseMessage{
			Status:  StatusCodeOk,
			Message: message,
		})
	}
}

func deleteCollection(db *mongo.Client) http.HandlerFunc {
	cmsCollections := db.Database(CMS_DATABASE).Collection(CMS_COLLECTIONS)

	return func(w http.ResponseWriter, r *http.Request) {
		collectionId, err := bson.ObjectIDFromHex(r.PathValue("id"))
		if err != nil {
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "Bad Id: " + err.Error()})
			log.Println("Error while deleting collection:", err)
			return
		}

		result, err := cmsCollections.DeleteOne(context.TODO(), bson.M{"_id": collectionId})
		if err != nil {
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax: " + err.Error()})
			log.Println("Error while deleting collection:", err)
			return
		}

		message := fmt.Sprintf("Deleted document with id (%v) successfully", collectionId)
		if result.DeletedCount == 0 {
			message = fmt.Sprintf("Failed to find document with id (%v)", collectionId)
		}

		WriteJSON(w, http.StatusOK, ResponseMessage{Status: StatusCodeOk, Message: message})
	}
}

func (c Collection) Validate() Misses {
	misses := make(Misses, 0)

	if c.Path == "" {
		misses["path"] = "path cannot be empty"
	}

	if c.Name == "" {
		misses["name"] = "name cannot be empty"
	}

	for k, v := range misses {
		delete(misses, k)
		misses["collection."+k] = v
	}

	nameSet := make(map[string]bool)

	for _, attr := range c.Attributes {
		_, exists := nameSet[attr.Name]
		if exists {
			misses["attributes."+attr.Name] = "Names must be unique"
			continue
		}

		if attr.Type != CollectionAttrTypeString && attr.Type != CollectionAttrTypeImage && attr.Type != CollectionAttrTypeDate && attr.Type != CollectionAttrTypeMDX {
			misses["attributes."+attr.Name] = "Type \"" + string(attr.Type) + "\" is not one of the valid types"
		}

		nameSet[attr.Name] = true
	}

	return misses
}

func (attr CollectionAttr) Validate() Misses {
	misses := make(Misses, 0)
	if attr.Type != CollectionAttrTypeString && attr.Type != CollectionAttrTypeImage && attr.Type != CollectionAttrTypeDate && attr.Type != CollectionAttrTypeMDX {
		misses["attributes."+attr.Name] = "Type \"" + string(attr.Type) + "\" is not one of the valid types"
	}

	return misses
}
