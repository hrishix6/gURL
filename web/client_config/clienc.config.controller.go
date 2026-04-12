package clientconfig

import (
	"gurl/shared/models"
	"gurl/web/internal/httpx"
	webModels "gurl/web/internal/models"
	"gurl/web/storage"
	"log"
	"net/http"
)

type ClientConfigController struct {
	httpx.BaseController
	storage   *storage.WebStorage
	clientCfg *models.GurlClientConfig
}

func NewClientConfigController(
	appVersion string,
	enbleDemoLogins bool,
	storage *storage.WebStorage,
) *ClientConfigController {

	clientCfg := &models.GurlClientConfig{
		ApiBaseURL:  "/api/v1",
		AuthBaseURL: "/auth",
		AppVersion:  appVersion,
		Mode:        "web",
		DemoEnabled: enbleDemoLogins,
	}

	return &ClientConfigController{
		storage:   storage,
		clientCfg: clientCfg,
	}
}

func (acc *ClientConfigController) GetAppConfig(w http.ResponseWriter, r *http.Request) {

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

	acc.clientCfg.SetupRequired = !appSetup.AdminUserConfigured
	acc.Ok(w, acc.clientCfg)
}

func (acc *ClientConfigController) Routes() http.Handler {
	appConfigMux := httpx.NewGurlWebRouter("")
	appConfigMux.Get("/config.json", acc.GetAppConfig)
	return httpx.RequestContext(httpx.RequestLogger(appConfigMux))
}
