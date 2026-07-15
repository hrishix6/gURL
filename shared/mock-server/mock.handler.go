package mockserver

import (
	"encoding/json"
	"fmt"
	"gurl/shared/db"
	"gurl/shared/internal"
	"gurl/shared/internal/interpolator"
	"gurl/shared/models"
	"gurl/shared/utils"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"gorm.io/gorm"
)

type MockServer struct {
	*http.ServeMux
	db *gorm.DB
}

func MockServerCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD")

			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (ms *MockServer) CollectionChecksHandler(next http.HandlerFunc) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		collectionId := r.PathValue("id")

		c, err := gorm.G[db.Collection](ms.db).Where("id = ?", collectionId).First(r.Context())

		if err != nil {
			http.NotFound(w, r)
			return
		}

		if c.MockServerKey == "" {
			http.NotFound(w, r)
			return
		}

		if !c.MockServerEnabled {
			http.NotFound(w, r)
			return
		}

		apiKey := r.Header.Get("x-gurl-mock-key")

		if apiKey != c.MockServerKey {
			w.WriteHeader(http.StatusForbidden)
			return
		}

		mockHandler := http.StripPrefix(fmt.Sprintf("%s/", collectionId), next)
		reqWithCollectionId := r.WithContext(utils.ContextWithCollectionId(r.Context(), collectionId))
		mockHandler.ServeHTTP(w, reqWithCollectionId)
	})
}

func SetMockHeaders(mock *db.Mock, w http.ResponseWriter, envMap map[string]string) {

	var mockHeaders []models.GurlKeyValItem

	err := json.Unmarshal(mock.ResponseHeaders, &mockHeaders)

	if err != nil {
		w.WriteHeader(500)
		return
	}

	for _, h := range mockHeaders {
		if h.Enabled == "on" {
			if envMap != nil {
				iKey := interpolator.Interpolate(interpolator.Preprocess(h.Key, envMap), envMap)
				iVal := interpolator.Interpolate(interpolator.Preprocess(h.Value, envMap), envMap)
				if iKey != "" {
					if _, ok := internal.SKIP_MOCK_HEADERS[iKey]; ok {
						continue
					}
					w.Header().Set(iKey, iVal)
				}
			} else {

				if _, ok := internal.SKIP_MOCK_HEADERS[h.Key]; ok {
					continue
				}

				w.Header().Set(h.Key, h.Value)
			}
		}
	}
}

func WritePlainTextResponse(mock *db.Mock, w http.ResponseWriter, envMap map[string]string) {
	if mock.ResponseDelayS != 0 {
		time.Sleep(time.Second * time.Duration(mock.ResponseDelayS))
	}

	SetMockHeaders(mock, w, envMap)

	//if user hasn't set conten-type set default
	if w.Header().Get("content-type") == "" {
		switch mock.BodyType {
		case "plaintext":
			w.Header().Set("content-type", "text/html")
		case "json":
			w.Header().Set("content-type", "application/json")
		case "xml":
			w.Header().Set("content-type", "application/xml")
		default:
			w.Header().Set("content-type", "text/html")
		}
	}

	//interpolate text body
	o := interpolator.Interpolate(interpolator.Preprocess(mock.TextBody, envMap), envMap)

	bytes := []byte(o)
	w.Header().Set("content-length", fmt.Sprintf("%d", len(bytes)))
	w.WriteHeader(int(mock.ResponseStatus))
	w.Write(bytes)
}

func WriteBinaryResponse(mock *db.Mock, w http.ResponseWriter, envMap map[string]string) {

	var fstats models.FileStats

	err := json.Unmarshal(mock.BinaryBody, &fstats)

	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}

	f, err := os.Open(fstats.Path)

	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}

	if mock.ResponseDelayS != 0 {
		time.Sleep(time.Second * time.Duration(mock.ResponseDelayS))
	}

	SetMockHeaders(mock, w, envMap)

	if w.Header().Get("content-type") == "" {
		detectedCtype, err := utils.DetectMimeType(fstats.Path)
		if err == nil {
			w.Header().Set("content-type", detectedCtype.String())
		} else {
			w.Header().Set("content-type", "application/octet-stream")
		}
	}

	w.Header().Set("content-length", fmt.Sprintf("%d", fstats.Size))

	w.WriteHeader(int(mock.ResponseStatus))
	n, err := io.Copy(w, f)

	if err != nil {
		log.Println(err)
	} else {
		log.Printf("written %d bytes to response \n", n)
	}
}

func (ms *MockServer) MockHandler(w http.ResponseWriter, r *http.Request) {

	collectionId := utils.CollectionIdFromContext(r.Context())

	if collectionId == "" {
		http.NotFound(w, r)
		return
	}

	log.Printf("[MockServer]: Incoming req at %s, method: %s\n", r.URL.Path, r.Method)

	searchPath := fmt.Sprintf("/%s", r.URL.Path)

	mocks, err := gorm.G[db.Mock](ms.db).Where("collection_id = ? AND path = ? AND method = ?", collectionId, searchPath, r.Method).Find(r.Context())

	if err != nil {
		http.NotFound(w, r)
		return
	}

	if len(mocks) == 0 {
		http.NotFound(w, r)
		return
	}

	var defaultMock *db.Mock

	matchId := r.Header.Get("x-gurl-mock-id")

	for _, mock := range mocks {

		if mock.Id == matchId {
			defaultMock = &mock
			break
		}
	}

	if defaultMock == nil {
		defaultMock = &mocks[0]
	}

	var envMap map[string]string

	if defaultMock.EnvironmentId != "" {
		env, err := gorm.G[db.Environment](ms.db).Where("id = ?", defaultMock.EnvironmentId).First(r.Context())

		if err == nil {
			log.Printf("[MockServer] using %s env for interpolation\n", env.Name)
			m, err := interpolator.PreprocessEnvData(string(env.Data))

			if err == nil {
				envMap = m
			} else {
				log.Printf("[MockServer] error in preprocess env data %vn", err)
			}
		} else {
			log.Printf("[MockServer] env with id %s not found\n", defaultMock.EnvironmentId)
		}
	} else {
		log.Println("[MockServer] No Active env set")
	}

	switch defaultMock.BodyType {
	case "plaintext", "json", "xml":
		WritePlainTextResponse(defaultMock, w, envMap)
		return
	case "binary":
		WriteBinaryResponse(defaultMock, w, envMap)
		return
	default:
		return
	}
}

func NewMockServer(db *gorm.DB) *MockServer {
	srv := &MockServer{
		db: db,
	}

	return srv
}
