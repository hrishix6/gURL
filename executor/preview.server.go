package executor

import (
	"gurl/internal"
	"log"
	"net/http"
	"strings"
)

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		origin := r.Header.Get("Origin")

		if strings.HasPrefix(origin, "wails://") {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func NewPreviewServer(tmpDir string, savedResponsesDir string) *http.Server {

	tmpFileServer := http.FileServer(http.Dir(tmpDir))
	savedResFileServer := http.FileServer(http.Dir(savedResponsesDir))

	previewHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println("[Executor] Preview handler hit:", r.URL.Path)

		if !(strings.HasPrefix(r.URL.Path, internal.SAVED_RESPONSES_PREFIX) || strings.HasPrefix(r.URL.Path, internal.TEMP_RESPONSE_PREFIX)) {
			http.NotFound(w, r)
			return
		}

		if strings.HasPrefix(r.URL.Path, internal.SAVED_RESPONSES_PREFIX) {
			http.StripPrefix(internal.SAVED_RESPONSES_PREFIX, savedResFileServer).ServeHTTP(w, r)
			return
		}

		if strings.HasPrefix(r.URL.Path, internal.TEMP_RESPONSE_PREFIX) {
			http.StripPrefix(internal.TEMP_RESPONSE_PREFIX, tmpFileServer).ServeHTTP(w, r)
			return
		}
	})

	previewServer := &http.Server{
		Handler: withCORS(previewHandler),
	}

	return previewServer
}
