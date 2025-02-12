package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type StatusCode string

const (
	StatusCodeOk    StatusCode = "ok"
	StatusCodeError StatusCode = "error"
)

type ResponseMessage struct {
	Status  StatusCode `json:"status"`
	Message string     `json:"message"`
	Data    any        `json:"data"`
}

type Misses map[string]string

type Validator interface {
	// A validator is valid only when len(errors) === 0
	// Each miss should be mapped to the corresponding validator field if it's related to one
	Validate() Misses
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

func ReadJSON[T any](s string) (T, error) {
	var data T
	err := json.Unmarshal([]byte(s), &data)
	return data, err
}

func ReadBodyJSON[T Validator](r *http.Request) (T, Misses, error) {
	var data T
	err := json.NewDecoder(r.Body).Decode(&data)

	if err != nil {
		return data, nil, err
	}

	misses := data.Validate()
	return data, misses, nil
}
