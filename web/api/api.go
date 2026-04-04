package api

import (
	"gurl/shared/utils"
	"gurl/web/auth"
	"gurl/web/executor"
	"gurl/web/exporter"
	"gurl/web/internal/httpx"
	"gurl/web/internal/models"
	"gurl/web/storage"
	"log"
	"net/http"
	"net/url"
)

type Api struct {
	httpx.BaseController
	domainURL *url.URL
	version   string
	storage   *storage.WebStorage
	executor  *executor.WebExecutor
	exporter  *exporter.WebExporter
	authSvc   *auth.AuthService
}

func NewApi(appName string, domainURL string, store *storage.WebStorage,
	exec *executor.WebExecutor,
	export *exporter.WebExporter,
	authSvc *auth.AuthService,
) *Api {

	d, err := url.Parse(domainURL)

	if err != nil {
		log.Fatalf("expected valid domain url: %v", err)
	}

	return &Api{
		domainURL: d,
		storage:   store,
		executor:  exec,
		exporter:  export,
		version:   "v1",
		authSvc:   authSvc,
	}
}

func (api *Api) ProtectedRoute(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		sessionCookie, err := api.authSvc.ExtractSessionCookie(r)

		if err != nil {
			api.WhoAreYou(w, api.WrapErrorResponse(r, models.RequestError{
				Message: "unauthorized",
				Details: "missing session cookie",
			}))

			return
		}

		userid, err := api.authSvc.ParseToken(sessionCookie.Value)

		if err != nil {
			api.WhoAreYou(w, api.WrapErrorResponse(r, models.RequestError{
				Message: "unauthorized",
				Details: "invalid or expired token",
			}))

			return
		}

		r = r.WithContext(utils.ContextWithUserId(r.Context(), userid))

		next.ServeHTTP(w, r)
	})
}

func (api *Api) Routes() http.Handler {

	apiMux := httpx.NewGurlWebRouter("")

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

	// admin
	apiMux.Post("/admin/invite", api.AdminGuard(api.InviteUser))

	return httpx.RequestContext(httpx.RequestLogger(api.ProtectedRoute(apiMux)))
}
