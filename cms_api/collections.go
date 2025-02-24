package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"maps"
	"net/http"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type NewCollection map[string]interface{}
type Collection map[string]interface{}

type CollectionAttrType string
const (
	CollectionAttrTypeString CollectionAttrType = "string"
	CollectionAttrTypeDate   CollectionAttrType = "date"
	CollectionAttrTypeImage  CollectionAttrType = "image"
	CollectionAttrTypeMDX    CollectionAttrType = "mdx"
)
var ValidAttrTypes map[CollectionAttrType]bool = map[CollectionAttrType]bool{
	CollectionAttrTypeString: true,
	CollectionAttrTypeDate: true,
	CollectionAttrTypeImage: true,
	CollectionAttrTypeMDX: true,
}

func handleCollectionRoutes(db *mongo.Client) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /collections", getCollections(db))
	mux.HandleFunc("GET /collections/{collection}", getCollectionSingle(db))
	mux.HandleFunc("POST /collections", createCollection(db))
	mux.HandleFunc("PUT /collections/{collection}", updateCollection(db))
	mux.HandleFunc("DELETE /collections/{collection}", deleteCollection(db))

	mux.HandleFunc("GET /{collection}", getData(db))
	mux.HandleFunc("GET /{collection}/{id}", getDataSingle(db))
	mux.HandleFunc("POST /{collection}", createData(db))
	mux.HandleFunc("PUT /{collection}/{id}", updateData(db))
	mux.HandleFunc("DELETE /{collection}/{id}", deleteData(db))

	mux.HandleFunc("OPTIONS /collections", handlePrefligh())
	mux.HandleFunc("OPTIONS /collections/{collection}", handlePrefligh())
	mux.HandleFunc("OPTIONS /{collection}", handlePrefligh())
	mux.HandleFunc("OPTIONS /{collection}/{id}", handlePrefligh())

	return mux
}

func getCollections(db *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cmsDB := db.Database(CMS_DATABASE)
		results, err := getDBResource(cmsDB, CMS_COLLECTIONS, bson.D{}, options.Find().SetProjection(publicProjection))
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
			Data:   results,
		})
	}
}

func getCollectionSingle(db *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cmsDB := db.Database(CMS_DATABASE)
		collectionPath := r.PathValue("collection")
		results, err := getDBResource(cmsDB, CMS_COLLECTIONS, bson.M{"path": collectionPath})
		if err != nil {
			WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
				Status:  StatusCodeError,
				Message: err.Error(),
			})
			log.Println(err.Error())
			return
		}

		var data any
		if len(results) > 0 {
			data = results[0]
		}

		WriteJSON(w, http.StatusOK, ResponseMessage{
			Status: StatusCodeOk,
			Data:   data,
		})
	}
}

func createCollection(db *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cmsDatabase := db.Database(CMS_DATABASE)
		newCollection, misses, err := ReadBodyJSON[NewCollection](r, db)
		if err != nil {
			response := ResponseMessage{Status: StatusCodeError, Message: err.Error(), Data: misses}
			WriteJSON(w, http.StatusBadRequest, response)
			log.Println("Error while creating new collection:", err)
			return
		}

		name, _ := (newCollection["name"]).(string)
		newCollection["path"] = StringToPath(name)
		newCollection["modifiedAt"] = time.Now()
		insertedCollection, err := createDBResource(cmsDatabase, CMS_COLLECTIONS, newCollection)
		if err != nil {
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax: " + err.Error()})
			log.Println("Error while creating new collection:", err)
			return
		}

		err = createDBCollection(cmsDatabase, (insertedCollection["path"]).(string))
		if err != nil {
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "Error while creating collection: " + err.Error()})
			log.Println("Error while creating new collection:", err)
			return
		}

		WriteJSON(w, http.StatusOK, ResponseMessage{Status: StatusCodeOk, Message: "Created collection successfully", Data: insertedCollection})
	}
}

func updateCollection(db *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cmsAdminDatabase := db.Database("admin")
		cmsDatabase := db.Database(CMS_DATABASE)
		collectionPath := r.PathValue("collection")
		collectionChanges, misses, err := ReadBodyJSON[Collection](r, db)
		if err != nil {
			response := ResponseMessage{Status: StatusCodeError, Message: err.Error(), Data: misses}
			WriteJSON(w, http.StatusBadRequest, response)
			log.Println("Error while updating collection:", err)
			return
		}

		var newCollectionPath string = collectionPath
		if _, exists := collectionChanges["name"]; exists {
			newCollectionPath = StringToPath((collectionChanges["name"]).(string))
		}

		if collectionPath != newCollectionPath {
			collectionChanges["path"] = newCollectionPath
			err := renameDBCollection(cmsAdminDatabase, CMS_DATABASE, collectionPath, newCollectionPath)
			if err != nil {
				errorMessage := fmt.Sprintf("Error while updating collections: %v", err.Error())
				WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
					Status:  StatusCodeError,
					Message: errorMessage,
				})
				log.Println(errorMessage)
				return
			}
		}

		updatedResource, err := updateDBResource(cmsDatabase, CMS_COLLECTIONS, bson.D{{Key:"name", Value: collectionPath}}, bson.M{"$set": bson.M{"attributes": ""}})
		if err != nil {
			errorMessage := fmt.Sprintf("Error while updating collections: %v", err.Error())
			WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
				Status:  StatusCodeError,
				Message: errorMessage,
			})
			log.Println(errorMessage)
			return
		}

		WriteJSON(w, http.StatusOK, ResponseMessage{
			Status:  StatusCodeOk,
			Message: fmt.Sprintf("Updated collection with path (%v)", collectionPath),
			Data:    updatedResource,
		})
	}
}

func deleteCollection(db *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cmsDatabase := db.Database(CMS_DATABASE)
		collectionPath := r.PathValue("collection")
		err := deleteDBResource(cmsDatabase, CMS_COLLECTIONS, bson.M{"path": collectionPath})
		if err != nil {
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: err.Error()})
			log.Println("Error while deleting collection:", err)
			return
		}

		deleteDBCollection(cmsDatabase, collectionPath)
		if err != nil {
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: err.Error()})
			log.Println("Error while deleting collection:", err)
			return
		}
		WriteJSON(w, http.StatusOK, ResponseMessage{Status: StatusCodeOk, Message: fmt.Sprintf("Deleted collection %q sucessfully", collectionPath)})
	}
}

func getData(db *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cmsDatabase := db.Database(CMS_DATABASE)
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

func createData(db *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cmsDatabase := db.Database(CMS_DATABASE)
		collectionPath := r.PathValue("collection")

		list, err := cmsDatabase.ListCollectionNames(context.TODO(), bson.M{"name": collectionPath})
		if err != nil {
			message := fmt.Sprintf("Error while creating new entry for collection (%v): %v", collectionPath, err.Error())
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: message})
			log.Println(message)
			return
		}

		if len(list) == 0 {
			message := fmt.Sprintf("Couldn't find collection (%v)", collectionPath)
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: message})
			return
		}

		newCollectionData, misses, err := ReadBodyJSON[CollectionData](r, db)
		if err == io.EOF {
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "No body was provided"})
			return
		}

		if err != nil {
			response := ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax: " + err.Error()}
			WriteJSON(w, http.StatusBadRequest, response)
			log.Println("Error while creating new data:", err)
			return
		}

		if len(misses) != 0 {
			response := ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax", Data: misses}
			WriteJSON(w, http.StatusBadRequest, response)
			log.Println("Error while creating new data:", err)
			return
		}

		cmsCollectionData := db.Database(CMS_DATABASE).Collection(collectionPath)
		response, err := cmsCollectionData.InsertOne(context.TODO(), newCollectionData)
		if err != nil {
			message := fmt.Sprintf("Error while creating data in collection (%v): %v", collectionPath, err.Error())
			WriteJSON(w, http.StatusInternalServerError, ResponseMessage{Status: StatusCodeError, Message: message})
			log.Println(message)
			return
		}

		newCollectionData["_id"] = (response.InsertedID).(bson.ObjectID)
		WriteJSON(w, http.StatusOK, ResponseMessage{Status: StatusCodeOk, Message: "Created collection successfully", Data: newCollectionData})
	}
}

func updateData(db *mongo.Client) http.HandlerFunc {
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

		newCollectionData, misses, err := ReadBodyJSON[CollectionData](r, db)
		if err == io.EOF {
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "No body was provided"})
			return
		}

		if err != nil {
			response := ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax: " + err.Error()}
			WriteJSON(w, http.StatusBadRequest, response)
			log.Println("Error while updating data:", err)
			return
		}

		if len(misses) != 0 {
			response := ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax", Data: misses}
			WriteJSON(w, http.StatusBadRequest, response)
			log.Println("Error while updating data:", err)
			return
		}

		cmsCollectionData := db.Database(CMS_DATABASE).Collection(collectionPath)
		dataHexId := r.PathValue("id")
		dataObjectId, err := bson.ObjectIDFromHex(dataHexId)
		response, err := cmsCollectionData.UpdateByID(context.TODO(), dataObjectId, bson.M{"$set": newCollectionData})
		if err != nil {
			message := fmt.Sprintf("Error while updating data for (%v) in collection (%v): %v", dataHexId, collectionPath, err.Error())
			WriteJSON(w, http.StatusInternalServerError, ResponseMessage{Status: StatusCodeError, Message: message})
			log.Println(message)
			return
		}

		if response.MatchedCount == 0 {
			WriteJSON(w, http.StatusOK, ResponseMessage{
				Status:  StatusCodeError,
				Message: fmt.Sprintf("Failed to update document with id (%v) in collection (%v)", dataHexId, collectionPath),
			})
			return
		}

		responseFind := cmsCollectionData.FindOne(context.TODO(), bson.M{"_id": dataObjectId})
		result := bson.M{}
		err = responseFind.Decode(&result)
		if err != nil && (mongo.IsNetworkError(err) || mongo.IsTimeout(err)) {
			message := fmt.Sprintf("Error while searching for (%v) in collection (%v): %v", dataHexId, collectionPath, err.Error())
			WriteJSON(w, http.StatusInternalServerError, ResponseMessage{Status: StatusCodeError, Message: message})
			log.Println(message)
			return
		}

		status := StatusCodeOk
		message := ""
		if _, exists := result["_id"]; exists == false {
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

func deleteData(db *mongo.Client) http.HandlerFunc {
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
		response, err := cmsCollectionData.DeleteOne(context.TODO(), bson.M{"_id": dataObjectId})
		if err != nil {
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{Status: StatusCodeError, Message: "Invalid Syntax: " + err.Error()})
			log.Println("Error while deleting collection:", err)
			return
		}

		message := fmt.Sprintf("Deleted document with id (%v) in collection (%v)", dataHexId, collectionPath)
		if response.DeletedCount == 0 {
			message = fmt.Sprintf("Failed to delete document with id (%v) in collection (%v)", dataHexId, collectionPath)
		}

		WriteJSON(w, http.StatusOK, ResponseMessage{Status: StatusCodeOk, Message: message})
	}
}

func handlePrefligh() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Add("Access-Control-Allow-Origin", "*")
		w.Header().Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Add("Access-Control-Allow-Headers", "*")
	}
}

var publicProjection = bson.M{
	"_id":        true,
	"createdAt":  bson.M{"$toDate": "$_id"},
	"modifiedAt": true,
	"name":       true,
	"path":       true,
	"attributes": true,
}

func (c Collection) Validate(r *http.Request, db *mongo.Client) Misses {
	misses := make(Misses, 0)

	expectOptional := map[string]bool{"name": true, "attributes": true}
	tooMany := make([]string, 0, 0)
	for key := range maps.Keys(c) {
		if _, exists := expectOptional[key]; exists == false {
			tooMany = append(tooMany, key)
		}
	}

	if len(tooMany) > 0 {
		misses["general.too_many_arguments"] = "The following keys are not in scope: " + strings.Join(tooMany, ", ")
		return misses
	}

	if attrs, exists := c["attributes"]; exists == true {
		uniqueAttrs := make(map[string]bool)

		listAttrs, ok := (attrs).([]interface{})
		if ok == false {
			misses["attributes"] = "Must be an array of {name: string, type string}"
		}

		for i, attr := range listAttrs {
			mappedAttr, ok := attr.(map[string]interface{})
			if ok == false || len(mappedAttr) != 2 {
				misses["attributes."+strconv.Itoa(i)] = "Must be an array of {name: string, type string}"
				continue
			}

			_, okName := mappedAttr["name"]
			_, okType := mappedAttr["type"]
			if okName == false || okType == false {
				misses["attributes."+strconv.Itoa(i)] = "Must be an array of {name: string, type string}"
				fmt.Println("Exists problem:", okName, okType)
				continue
			}

			name, okNameString := mappedAttr["name"].(string)
			attrType, okTypeString := mappedAttr["type"].(string)
			if okNameString == false || okTypeString == false {
				misses["attributes."+strconv.Itoa(i)] = "Must be an array of {name: string, type string}"
				fmt.Println("Type problem:", okNameString, okTypeString)
				continue
			}

			if _, exists := uniqueAttrs[name]; exists == true {
				misses["attributes."+strconv.Itoa(i)] = fmt.Sprintf("Attribute %q at pos %v must be unique", name, i)
				continue
			}

			if _, exists := ValidAttrTypes[CollectionAttrType(attrType)]; exists == false {
				misses["attributes."+strconv.Itoa(i)] = fmt.Sprintf("Attribute %q must be of a valid type", name)
				continue
			}

			uniqueAttrs[name] = true
		}
	}

	return misses
}

func (n NewCollection) Validate(r *http.Request, db *mongo.Client) Misses {
	misses := Collection(n).Validate(r, db)
	results, err := getDBResource(db.Database(CMS_DATABASE), CMS_COLLECTIONS, bson.M{"name": n["name"]})
	if err != nil && err != mongo.ErrNoDocuments {
		misses["general.other"] = err.Error()
		return misses
	}

	if len(results) != 0 {
		misses["name"] = "Must be unique"
	}

	return misses
}

type CollectionData map[string]any

func (d CollectionData) Validate(r *http.Request, db *mongo.Client) Misses {
	misses := make(Misses, 0)

	collection := db.Database(CMS_DATABASE).Collection(CMS_COLLECTIONS)
	response := collection.FindOne(context.TODO(), bson.M{"path": r.PathValue("collection")})
	result := bson.M{}
	err := response.Decode(&result)
	if err != nil {
		misses["general.other"] = err.Error()
		return misses
	}

	expectOptional := map[string]bool{}
	for _, value := range (result["attributes"]).(bson.A) {
		data := (value).(bson.D)
		column := (data[0].Value).(string)
		expectOptional[column] = true
	}

	tooMany := make([]string, 0, 0)
	for key := range maps.Keys(d) {
		if _, exists := expectOptional[key]; exists == false {
			tooMany = append(tooMany, key)
		}
	}

	if len(tooMany) > 0 {
		misses["general.too_many_arguments"] = "The following keys are not in scope: " + strings.Join(tooMany, ", ")
		return misses
	}

	return misses
}
