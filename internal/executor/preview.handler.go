package executor

import (
	"gurl/internal"
	"log"
	"net/http"
	"strings"
)

func NewPreviewHandler(tmpDir string, savedResponsesDir string) http.HandlerFunc {

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

	return previewHandler
}
