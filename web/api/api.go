package api

import (
	"encoding/json"
	"gurl/web/executor"
	"gurl/web/exporter"
	"gurl/web/storage"
	"net/http"
	"time"
)

type ReqMetadata struct {
	Timestamp time.Time `json:"timestamp,omitempty"`
	RequestId string    `json:"request_id,omitempty"`
}

type RequestError struct {
	Message string `json:"message"`
	Details any    `json:"details"`
}

type ApiResponse struct {
	Data     any           `json:"data,omitempty"`
	MetaData *ReqMetadata  `json:"metadata"`
	Error    *RequestError `json:"error,omitempty"`
}

type Api struct {
	version  string
	storage  *storage.WebStorage
	executor *executor.WebExecutor
	exporter *exporter.WebExporter
}

func NewApi(store *storage.WebStorage,
	exec *executor.WebExecutor,
	export *exporter.WebExporter) *Api {
	return &Api{
		storage:  store,
		executor: exec,
		exporter: export,
	}
}

func (a *Api) json(v any) []byte {
	bytes, err := json.Marshal(v)

	if err != nil {
		panic(err)
	}

	return bytes
}

func (a *Api) Ok(w http.ResponseWriter, payload any) {
	w.Header().Set("content-type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write(a.json(payload))
}

func (a *Api) Bad(w http.ResponseWriter, payload any) {
	w.Header().Set("content-type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	w.Write(a.json(payload))
}

func (a *Api) Created(w http.ResponseWriter, payload any) {
	w.Header().Set("content-type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusCreated)
	w.Write(a.json(payload))
}

func (a *Api) NoEntry(w http.ResponseWriter, payload any) {
	w.Header().Set("content-type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusForbidden)
	w.Write(a.json(payload))
}

func (a *Api) NotFound(w http.ResponseWriter, payload any) {
	w.Header().Set("content-type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusNotFound)
	w.Write(a.json(payload))
}

func (a *Api) WhoAreYou(w http.ResponseWriter, payload any) {
	w.Header().Set("content-type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusUnauthorized)
	w.Write(a.json(payload))
}

func (a *Api) ServerCooked(w http.ResponseWriter, payload any) {
	w.Header().Set("content-type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusInternalServerError)
	w.Write(a.json(payload))
}

func (a *Api) WrapSuccessResponse(r *http.Request, payload any) *ApiResponse {

	reqId, _ := ReqIdFromCtx(r.Context())

	return &ApiResponse{
		Data: payload,
		MetaData: &ReqMetadata{
			Timestamp: time.Now(),
			RequestId: reqId,
		},
	}
}

func (a *Api) WrapErrorResponse(r *http.Request, error *RequestError) *ApiResponse {

	reqId, _ := ReqIdFromCtx(r.Context())

	return &ApiResponse{
		Error: error,
		MetaData: &ReqMetadata{
			Timestamp: time.Now(),
			RequestId: reqId,
		},
	}

}

func (api *Api) Routes() http.Handler {

	apiMux := NewGurlWebRouter("")

	apiMux.Get("/health", func(w http.ResponseWriter, r *http.Request) {

		meta := &struct {
			Message string `json:"msg"`
		}{
			Message: "OK",
		}

		api.Ok(w, api.WrapSuccessResponse(r, meta))
	})

	//ui state
	apiMux.Get("/ui", api.GetUIState)
	apiMux.Patch("/ui", api.UpdateUIState)

	//workspaces
	apiMux.Get("/workspaces", api.GetAllWorkspaces)
	apiMux.Post("/workspaces", api.CreateWorkspace)
	apiMux.Get("/workspaces/{id}", api.GetWorkspaceById)
	apiMux.Patch("/workspaces/{id}", api.UpdateWorkspace)

	//collections
	apiMux.Get("/collections", api.GetAllCollections)
	apiMux.Post("/collections", api.CreateCollection)
	apiMux.Delete("/collections/{id}", api.DeleteCollection)
	apiMux.Post("/collections/{id}/clear", api.ClearCollection)
	apiMux.Delete("/collections/{id}/drafts", api.SoftDeleteReqDraftsUnderCollection)
	apiMux.Post("/collections/{id}/rename", api.RenameCollection)

	//reqs
	apiMux.Get("/reqs", api.GetRequests)
	apiMux.Delete("/reqs/{id}", api.DeleteReq)
	apiMux.Post("/reqs/{id}", api.CopyRequest)
	apiMux.Delete("/reqs/{id}/drafts", api.SoftDeleteReqDraftsUnderReq)
	apiMux.Post("/reqs/{id}/drafts", api.CreateDraftFromRequest)

	//req-drafts
	apiMux.Post("/req-drafts", api.CreateReqDraft)
	apiMux.Get("/req-drafts/{id}", api.GetReqDraftById)
	apiMux.Patch("/req-drafts/{id}", api.UpdateReqDraftFields)
	apiMux.Delete("/req-drafts/{id}", api.DeleteReqDraft)
	apiMux.Post("/req-drafts/{id}", api.SaveDraftAsRequest)
	apiMux.Post("/req-drafts-fresh", api.CreateFreshReqDraft)

	//req-examples
	apiMux.Get("/req-examples", api.GetReqExamples)
	apiMux.Post("/req-examples", api.CreateReqExample)
	apiMux.Get("/req-examples/{id}", api.GetReqExampleById)
	apiMux.Delete("/req-examples/{id}", api.DeleteReqExample)

	//env
	apiMux.Get("/envs", api.GetEnvironments)
	apiMux.Post("/envs", api.CreateEnvironment)
	apiMux.Post("/envs/{id}", api.CopyEnvironment)
	apiMux.Delete("/envs/{id}", api.DeleteEnvironment)
	apiMux.Delete("/envs/{id}/drafts", api.DeleteEnvDraftsUnderEnv)

	//env-drafts
	apiMux.Post("/env-drafts", api.CreateEnvDraft)
	apiMux.Get("/env-drafts/{id}", api.GetEnvDraftbyId)
	apiMux.Post("/env-drafts/{id}", api.SaveEnvDraftAsEnv)
	apiMux.Delete("/env-drafts/{id}", api.DeleteEnvDraft)
	apiMux.Patch("/env-drafts/{id}", api.UpdateEnvDraft)
	apiMux.Post("/env-drafts-fresh", api.CreateFreshEnvDraft)

	//exec
	apiMux.Post("/exec", api.SendHttpReq)
	apiMux.Put("/exec/{id}/cancel", api.CancelReq)
	apiMux.Post("/exec/parse_cookie", api.ParseCookieRaw)
	apiMux.Post("/exec/src_path", api.GetSavedResponsesSrc)
	apiMux.Put("/exec/tmp/upload", api.UploadTempFormFile)
	apiMux.Post("/exec/tmp/download", api.DownloadTempFile)

	//import-export
	apiMux.Post("/import/env", api.ImportEnvironment)
	apiMux.Post("/import/collection", api.ImportCollection)
	apiMux.Get("/export/env/{id}", api.DownloadEnvironmentExport)
	apiMux.Get("/export/collection/{id}", api.DownloadCollectionExport)

	return RequestContext(RequestLogger(apiMux))
}
