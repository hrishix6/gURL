package executor

import (
	"gurl/internal"
	"log"
	"net/http"
	"strings"
)

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "wails://wails.localhost:34115")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func NewPreviewServer(tmpDir string) *http.Server {

	fileServer := http.FileServer(http.Dir(tmpDir))

	previewHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println("[Executor] Preview handler hit:", r.URL.Path)

		if !strings.HasPrefix(r.URL.Path, internal.SAVED_RESPONSES_PREFIX) {
			http.NotFound(w, r)
			return
		}

		http.StripPrefix(internal.SAVED_RESPONSES_PREFIX, fileServer).ServeHTTP(w, r)
	})

	previewServer := &http.Server{
		Handler: withCORS(previewHandler),
	}

	return previewServer
}
