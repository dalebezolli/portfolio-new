package main

import (
	"log"
	"maps"
	"net/http"
	"os"
	"strings"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"golang.org/x/crypto/bcrypt"
)

func handleAuthRoutes(db *mongo.Client) *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("POST /login", login(db))
	mux.HandleFunc("OPTIONS /login", handlePrefligh())

	return mux
}

func login(db *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		body, misses, err := ReadBodyJSON[LoginBody](r, db)
		if err != nil {
			WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
				Status: StatusCodeError,
				Message: err.Error(),
				Data: misses,
			})
			return
		}

		password, ok := body["pass"].(string)
		if ok == false {
			WriteJSON(w, http.StatusBadRequest, ResponseMessage{
				Status: StatusCodeError,
				Message: "Password must be a string",
			})
			return
		}
		
		isValid := validatePassword(password)
		if isValid == false {
			WriteJSON(w, http.StatusUnauthorized, ResponseMessage{
				Status: StatusCodeError,
				Message: "Bad password",
			})
			return
		}

		WriteJSON(w, http.StatusOK, ResponseMessage{
			Status: StatusCodeOk,
			Message: "Hello World",
		})
	}
}

func ensureLoggedIn(next func(http.ResponseWriter, *http.Request)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			password := r.Header.Get("Authorization")
			if password == "" {
				WriteJSON(w, http.StatusUnauthorized, ResponseMessage{
					Status: StatusCodeError,
					Message: "Not authorized to perform this action",
				})
				return
			}

			isValid := validatePassword(password)
			if isValid == false {
				WriteJSON(w, http.StatusUnauthorized, ResponseMessage{
					Status: StatusCodeError,
					Message: "Bad password",
				})
				return
			}
		}

		next(w, r)
	}
}

func validatePassword(password string) bool {
	expectedHash := os.Getenv("LOGIN_HASH")
	log.Println("Authenticating against:", expectedHash)
	err := bcrypt.CompareHashAndPassword([]byte(expectedHash), []byte(password))
	if err != nil {
		hash, _ := bcrypt.GenerateFromPassword([]byte(password), 14)
		log.Println("Expected", string(hash))
		return false
	}

	return true
}

type LoginBody map[string]interface{}
func (l LoginBody) Validate(r *http.Request, db *mongo.Client) Misses {
	misses := make(Misses, 0)

	expectOptional := map[string]bool{"pass": true}
	tooMany := make([]string, 0, 0)
	for key := range maps.Keys(l) {
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
