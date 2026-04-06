package config

import (
	"gurl/shared/models"
	"gurl/web/internal/httpx"
	webModels "gurl/web/internal/models"
	"gurl/web/storage"
	"log"
	"net/http"
)

type AppConfigController struct {
	httpx.BaseController
	storage          *storage.WebStorage
	appVersion       string
	apiBaseUrl       string
	authBaseUrl      string
	enableDemoLogins bool
}

func NewAppConfigController(
	appVersion string,
	apiBaseUrl string,
	authBaseUrl string,
	storage *storage.WebStorage,
	enbleDemoLogins bool,
) *AppConfigController {
	return &AppConfigController{
		storage:          storage,
		appVersion:       appVersion,
		apiBaseUrl:       apiBaseUrl,
		authBaseUrl:      authBaseUrl,
		enableDemoLogins: enbleDemoLogins,
	}
}

func (acc *AppConfigController) GetAppConfig(w http.ResponseWriter, r *http.Request) {

	appSetup, err := acc.storage.AppSetupRepo.GetAppSetup(r.Context())

	if err != nil {
		log.Printf("[api/GetAppConfig] error:%v \n", err)
		wrappedErrResponse := acc.WrapErrorResponse(r, webModels.RequestError{
			Message: "failed to load app setup from db",
			Details: err.Error(),
		})

		acc.ServerCooked(w, wrappedErrResponse)
		return
	}

	gurlClientConfig := models.GurlClientConfig{
		Mode:          "web",
		ApiBaseURL:    acc.apiBaseUrl,
		AuthBaseURL:   acc.authBaseUrl,
		AppVersion:    acc.appVersion,
		SetupRequired: !appSetup.AdminUserConfigured,
		DemoEnabled:   acc.enableDemoLogins,
	}

	acc.Ok(w, gurlClientConfig)
}

func (acc *AppConfigController) Routes() http.Handler {
	appConfigMux := httpx.NewGurlWebRouter("")
	appConfigMux.Get("/config.json", acc.GetAppConfig)
	return httpx.RequestContext(httpx.RequestLogger(appConfigMux))
}
