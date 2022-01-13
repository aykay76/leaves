package controllers

import (
	"fmt"
	"io/ioutil"
	"mime"
	"net/http"
	"path/filepath"
	"strings"
	"text/template"
)

func DefaultController(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.URL.Path)

	// get the metadata and group by repository
	var model interface{}

	if strings.HasPrefix(r.URL.Path, "/static") {
		filename := "internal" + r.URL.Path
		fmt.Println(filename)
		body, err := ioutil.ReadFile(filename)
		if err != nil {
			fmt.Println(err)
		}

		ext := filepath.Ext(r.URL.Path)

		mimeType := mime.TypeByExtension(ext)
		w.Header().Set("Content-Type", mimeType)

		w.Write(body)
	} else {
		path := strings.TrimLeft(r.URL.Path, "/")
		if path == "" {
			path = "index.html"
		}
		fmt.Println(path)
		t, err := template.ParseFiles("internal/templates/"+path, "internal/templates/head.html", "internal/templates/tail.html")
		if err != nil {
			panic(err)
		}

		// TODO: prepare results from metadata, I don't want to show all tags for each repository on the home page
		// so I need to "group by" repository name and display the latest tag, with an indication there are
		// x more tags for that repository. clicking through to the repository page will show all the tags
		// or clicking on the tag will take users to the repository/tag page
		err = t.ExecuteTemplate(w, path, model)
		if err != nil {
			panic(err)
		}
	}
}
