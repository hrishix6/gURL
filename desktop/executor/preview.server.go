package executor

import (
	"gurl/internal/executor"
	"net/http"
	"strings"
)

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		origin := r.Header.Get("Origin")

		if strings.HasPrefix(origin, "wails://") || strings.HasPrefix(origin, "http://localhost") {
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
	previewHandler := executor.NewPreviewHandler(tmpDir, savedResponsesDir)
	previewServer := &http.Server{
		Handler: withCORS(previewHandler),
	}

	return previewServer
}
