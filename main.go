package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/aykay76/leaves/internal/controllers"
)

func main() {
	http.HandleFunc("/", controllers.DefaultController)

	fmt.Println("Ready to listen on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
