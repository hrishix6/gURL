package api

import (
	"fmt"
	"gurl/shared/utils"
	"gurl/web/auth"
	"gurl/web/executor"
	"gurl/web/exporter"
	"gurl/web/internal"
	"gurl/web/internal/config"
	"gurl/web/internal/httpx"
	"gurl/web/internal/models"
	"gurl/web/storage"
	"log"
	"net/http"
	"net/url"
	"strings"
)

type Api struct {
	httpx.BaseController
	domainURL  *url.URL
	version    string
	tmpDir     string
	persistDir string
	storage    *storage.WebStorage
	executor   *executor.WebExecutor
	exporter   *exporter.WebExporter
	authSvc    *auth.AuthService
}

func NewApi(
	cfg *config.WebApplicationConfig,
	store *storage.WebStorage,
	exec *executor.WebExecutor,
	export *exporter.WebExporter,
	authSvc *auth.AuthService,
) *Api {

	d, err := url.Parse(cfg.FrontendURL)

	if err != nil {
		log.Fatalf("expected valid domain url: %v", err)
	}

	return &Api{
		domainURL:  d,
		storage:    store,
		executor:   exec,
		exporter:   export,
		version:    "v1",
		authSvc:    authSvc,
		tmpDir:     cfg.BaseTmpDir,
		persistDir: cfg.BaseSavedResponsesDir,
	}
}

func (api *Api) ProtectFromDemoUser(next http.HandlerFunc) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {
		userId := utils.UserIdFromContext(r.Context())
		isDemoUser := strings.HasPrefix(userId, internal.DEMO_USER_ID_PREFIX)
		if isDemoUser {
			pattern := fmt.Sprintf("%s %s", r.Method, r.URL.Path)
			log.Printf("Demo user %s  denied%s\n", userId, pattern)

			api.NoEntry(w, api.WrapErrorResponse(r, models.RequestError{
				Message: "not allowed",
			}))

			return
		}

		next.ServeHTTP(w, r)
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

		claims, err := api.authSvc.ParseToken(sessionCookie.Value)

		if err != nil {
			api.WhoAreYou(w, api.WrapErrorResponse(r, models.RequestError{
				Message: "unauthorized",
				Details: "invalid or expired token",
			}))

			return
		}

		r = r.WithContext(utils.ContextWithUserId(r.Context(), claims.UserId))

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
	apiMux.Post("/workspaces", api.ProtectFromDemoUser(api.CreateWorkspace))
	apiMux.Get("/workspaces/{id}", api.GetWorkspaceById)
	apiMux.Patch("/workspaces/{id}", api.UpdateWorkspace)

	//collections
	apiMux.Get("/collections", api.GetAllCollections)
	apiMux.Get("/collections/{id}", api.GetCollectionById)
	apiMux.Post("/collections", api.ProtectFromDemoUser(api.CreateCollection))
	apiMux.Delete("/collections/{id}", api.ProtectFromDemoUser(api.DeleteCollection))
	apiMux.Post("/collections/{id}/clear", api.ClearCollection)
	apiMux.Post("/collections/{id}/rename", api.ProtectFromDemoUser(api.RenameCollection))
	apiMux.Post("/collections/{id}/mockserver", api.CreateMockServer)
	apiMux.Patch("/collections/{id}/mockserver/enable", api.EnableMockServer)
	apiMux.Patch("/collections/{id}/mockserver/disable", api.DisableMockServer)

	//reqs
	apiMux.Get("/reqs", api.GetRequests)
	apiMux.Get("/reqs/{id}", api.GetReqById)
	apiMux.Delete("/reqs/{id}", api.DeleteReq)
	apiMux.Post("/reqs/{id}", api.CopyRequest)
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
	apiMux.Post("/req-examples/{id}/mock", api.CreateMockFromExample)
	apiMux.Delete("/req-examples/{id}", api.ProtectFromDemoUser(api.DeleteReqExample))

	//mocks
	apiMux.Get("/mock-drafts/{id}", api.ProtectFromDemoUser(api.GetMockDraftById))
	apiMux.Post("/mock-drafts/{id}", api.ProtectFromDemoUser(api.SaveMockDraftAsMock))
	apiMux.Delete("/mock-drafts/{id}", api.ProtectFromDemoUser(api.DeleteMockDraft))
	apiMux.Patch("/mock-drafts/{id}", api.ProtectFromDemoUser(api.UpdateMockDraftFields))
	apiMux.Post("/mock-drafts-fresh", api.ProtectFromDemoUser(api.CreateFreshMockDraft))
	apiMux.Get("/mocks", api.ProtectFromDemoUser(api.GetMocks))
	apiMux.Get("/mocks/{id}", api.ProtectFromDemoUser(api.GetMockById))
	apiMux.Post("/mocks/{id}/copy", api.ProtectFromDemoUser(api.CopyMockWithId))
	apiMux.Delete("/mocks/{id}", api.ProtectFromDemoUser(api.DeleteMock))
	apiMux.Post("/mocks/{id}/drafts", api.ProtectFromDemoUser(api.CreateMockDraftFromMock))

	//env
	apiMux.Get("/envs", api.GetEnvironments)
	apiMux.Post("/envs", api.ProtectFromDemoUser(api.CreateEnvironment))
	apiMux.Post("/envs/{id}", api.ProtectFromDemoUser(api.CopyEnvironment))
	apiMux.Delete("/envs/{id}", api.ProtectFromDemoUser(api.DeleteEnvironment))
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
	apiMux.Post("/exec/interpolate", api.GetInterpolatedReq)
	apiMux.Put("/exec/{id}/cancel", api.CancelReq)
	apiMux.Post("/exec/parse_cookie", api.ParseCookieRaw)
	apiMux.Post("/exec/src_path", api.GetSavedResponsesSrc)
	apiMux.Put("/exec/tmp/upload", api.UploadTempFormFile)
	apiMux.Post("/exec/tmp/download", api.DownloadTempFile)

	//import-export
	apiMux.Post("/import/env", api.ProtectFromDemoUser(api.ImportEnvironment))
	apiMux.Post("/import/collection", api.ProtectFromDemoUser(api.ImportCollection))
	apiMux.Get("/export/env/{id}", api.DownloadEnvironmentExport)
	apiMux.Get("/export/collection/{id}", api.DownloadCollectionExport)

	// admin
	apiMux.Post("/admin/invite", api.AdminGuard(api.InviteUser))

	return httpx.RequestContext(httpx.RequestLogger(api.ProtectedRoute(apiMux)))
}
