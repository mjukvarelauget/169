package main

import (
	"net/http"
	"encoding/json"
	"fmt"
	"os"
	"github.com/gorilla/mux"
	"io/ioutil"
)

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
}

func main() {
	r := mux.NewRouter()

	r.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Go go server"))
	})

	r.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Ok"))
	})


	r.HandleFunc("/{electionType}/{year}", GetNationalElectionResults).Methods("GET")
	r.HandleFunc("/{electionType}/{year}/{county}", GetCountyElectionResults).Methods("GET")
	fmt.Println("Server at 8080")
	http.ListenAndServe(":8080", r)
}

func GetNationalElectionResults(w http.ResponseWriter, r *http.Request) {
	enableCors(&w)
	params := mux.Vars(r)
	
	electionType := params["electionType"]
	year := params["year"]

	jsonFile, err := os.Open("data/"+electionType+"/"+year+"/"+year+electionType+".json")
	
	if err != nil {
		fmt.Println(err)
	}
	
	defer jsonFile.Close()

	byteValue, _ := ioutil.ReadAll(jsonFile)

	var result map[string]interface{}
	json.Unmarshal([]byte(byteValue), &result)

	json.NewEncoder(w).Encode(result)
}

func GetCountyElectionResults(w http.ResponseWriter, r *http.Request){
	enableCors(&w)
	params := mux.Vars(r)

	electionType := params["electionType"]
	year := params["year"]
	county := params["county"]

	jsonFile, err := os.Open("data/"+electionType+"/"+year+"/"+county+".json")
	
	if err != nil {
		fmt.Println(err)
	}
	
	defer jsonFile.Close()

	byteValue, _ := ioutil.ReadAll(jsonFile)

	var result map[string]interface{}
	json.Unmarshal([]byte(byteValue), &result)

	json.NewEncoder(w).Encode(result)
}