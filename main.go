package main

import (
	"embed"
	"os"
)

//go:embed all:frontend/dist/gurl/browser
var assets embed.FS

//go:embed all:frontend/dist/gurl/browser/mime.db.json
var mimedbJson []byte

func main() {

	env, ok := os.LookupEnv("ENV")

	if !ok {
		env = "PROD"
	}

	mode, ok := os.LookupEnv("MODE")

	if !ok {
		mode = "desktop"
	}

	if mode == "web" {
		initializeWebApp(env)
	} else if mode == "desktop" {
		initializeDesktopApp(env)
	}
}
