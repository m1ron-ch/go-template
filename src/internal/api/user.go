package api

import (
	"fmt"
	"net/http"
)

func Hello(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Hello World")
	fmt.Fprintln(w, "Hello World")
}
