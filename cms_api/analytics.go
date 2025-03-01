package main

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func handleAnalyticsRoutes(db *mongo.Client) *http.ServeMux {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /stats", getStatistics(db))
	mux.HandleFunc("GET /identify", identify(db))

	return mux
}

// Ideally this will be precalculated every so often
// For now though we'll be manually calculating every aspect of the data to simplify the logic
func getStatistics(db *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		startDateString := r.URL.Query().Get("start")
		endDateString := r.URL.Query().Get("end")

		filter := bson.D{}
		if startDateString != "" {
			time, err := time.Parse(time.RFC3339, startDateString)
			if err != nil {
				log.Printf("Failed to parse start date string with %q", startDateString)
			} else {
				filter = append(filter, bson.E{Key: "loggedAt", Value: bson.D{{Key: "$gte", Value: time}}})
			}
		}

		if endDateString != "" {
			time, err := time.Parse(time.RFC3339, endDateString)
			if err != nil {
				log.Printf("Failed to parse end date string with %q", endDateString)
			} else {
				filter = append(filter, bson.E{Key: "loggedAt", Value: bson.D{{Key: "$lte", Value: time}}})
			}
		}

		log.Println("Filtering with: ", filter)

		cmsDatabase := db.Database(CMS_DATABASE)
		results, err := getDBResource(cmsDatabase, CMS_C_ANALYTICS_USERS, filter)
		if err != nil {
			WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
				Status:  StatusCodeError,
				Message: err.Error(),
			})
			return
		}

		totalVisitorsByCountry := make(map[string]int)
		totalVisits := 0
		totalUniqueVisits := 0

		for _, analytic := range results {
			currentVisitCount := int((analytic["visitCount"]).(int32))
			totalVisits += int((analytic["visitCount"]).(int32))
			totalUniqueVisits++
			count, exists := totalVisitorsByCountry[(analytic["countryCode"]).(string)]
			if exists {
				totalVisitorsByCountry[(analytic["countryCode"]).(string)] = count + currentVisitCount
			} else {
				totalVisitorsByCountry[(analytic["countryCode"]).(string)] = currentVisitCount
			}
		}

		WriteJSON(w, http.StatusOK, ResponseMessage{
			Status: StatusCodeOk,
			Data: map[string]any{
				"totalVisitorsByCountry": totalVisitorsByCountry,
				"totalVisits":            totalVisits,
				"totalUniqueVisits":      totalUniqueVisits,
			},
		})
	}
}

func identify(db *mongo.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		visitor := getCloudflareVisitorDetails(r)
		if visitor.Ip == "" {
			visitor.Ip = cleanIpFromPort(r.RemoteAddr)
			visitor = getIPInfoDetails(visitor.Ip)
		}

		cookie, err := r.Cookie(visitorCookieKey)
		if err == nil {
			visitor.Visited = cookie != nil
		}

		cmsDatabase := db.Database(CMS_DATABASE)
		if visitor.Visited == false {
			visitor.UserId = rand.Text()
		} else {
			visitor.UserId = cookie.Value
		}

		res, err := getDBResource(cmsDatabase, CMS_C_ANALYTICS_USERS, bson.M{"userId": visitor.UserId})
		if err != nil {
			WriteJSON(w, http.StatusInternalServerError, ResponseMessage{
				Status:  StatusCodeError,
				Message: "Error while collecting analytics details: " + err.Error(),
			})
			return
		}

		analytic := &Analytic{
			Ip:          visitor.Ip,
			UserId:      visitor.UserId,
			CountryCode: visitor.CountryCode,
			LoggedAt:    time.Now(),
		}

		if len(res) == 0 {
			http.SetCookie(w, &http.Cookie{
				Name:   visitorCookieKey,
				Value:  visitor.UserId,
				Secure: true,
			})

			analytic.VisitCount = 1
			createDBResource(cmsDatabase, CMS_C_ANALYTICS_USERS, analytic.ToMap())
		} else {
			rawCount, _ := res[0]["visitCount"]
			count, _ := (rawCount).(int32)
			analytic.VisitCount = int(count) + 1

			updateDBResource(cmsDatabase, CMS_C_ANALYTICS_USERS,
				bson.D{{Key: "userId", Value: visitor.UserId}},
				bson.M{"$set": analytic.ToMap()})
		}

		WriteJSON(w, http.StatusOK, ResponseMessage{
			Status:  StatusCodeOk,
			Message: "Identified User",
			Data:    analytic,
		})
	}
}

const visitorCookieKey = "userId"

type Visitor struct {
	UserId      string
	Ip          string
	CountryCode string
	Visited     bool
}

func (v *Visitor) ToMap() map[string]interface{} {
	return map[string]interface{}{
		"userId":      v.UserId,
		"ip":          v.Ip,
		"countryCode": v.CountryCode,
		"visited":     v.Visited,
	}
}

type Analytic struct {
	UserId      string
	Ip          string
	CountryCode string
	VisitCount  int
	LoggedAt    time.Time
}

func (a *Analytic) ToMap() map[string]interface{} {
	return map[string]interface{}{
		"userId":      a.UserId,
		"ip":          a.Ip,
		"countryCode": a.CountryCode,
		"visitCount":  a.VisitCount,
		"loggedAt":    bson.NewDateTimeFromTime(a.LoggedAt),
	}
}

func getCloudflareVisitorDetails(r *http.Request) *Visitor {
	return &Visitor{
		Ip:          r.Header.Get("Cf-Connecting-Ip"),
		CountryCode: r.Header.Get("Cf-Ipcountry"),
		Visited:     false,
	}
}

func updateVisitorInfo(db *mongo.Database, visitor *Visitor) {
}

func getIPInfoDetails(ip string) *Visitor {
	visitor := &Visitor{Ip: ip}

	response, err := http.Get(fmt.Sprintf("https://ipinfo.io/%s/json", ip))
	if err != nil {
		return visitor
	}

	var responseBody map[string]string
	err = json.NewDecoder(response.Body).Decode(&responseBody)
	if err != nil {
		return visitor
	}

	isBogon, exists := responseBody["bogon"]
	if exists && isBogon == "true" {
		return visitor
	}

	country, exists := responseBody["country"]
	if exists {
		visitor.CountryCode = country
	}

	return visitor
}

func cleanIpFromPort(remoteAddr string) string {
	return strings.Split(remoteAddr, ":")[0]
}
