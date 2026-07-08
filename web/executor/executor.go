package executor

import (
	"context"
	"fmt"
	internalExec "gurl/shared/executor"
	"gurl/shared/models"
	"gurl/shared/utils"
	"gurl/web/internal"
	"gurl/web/internal/config"
	"gurl/web/storage"
	"log"
	"net/http"
	"os"
)

type WebExecutor struct {
	storage        *storage.WebStorage
	httpExecutor   *internalExec.HttpExecutor
	previewSrvAddr string
	tmpDir         string
	persistDir     string
}

func NewWebExecutor(
	appCfg *config.WebApplicationConfig,
	storage *storage.WebStorage,
) *WebExecutor {

	previewSrvAddr := fmt.Sprintf("%s/preview", appCfg.FrontendURL)

	return &WebExecutor{
		storage:        storage,
		previewSrvAddr: previewSrvAddr,
		tmpDir:         appCfg.BaseTmpDir,
		httpExecutor: internalExec.NewHttpExecutor(
			appCfg.AppName,
			appCfg.BaseTmpDir,
			appCfg.BaseSavedResponsesDir,
			storage.MimeRepo,
			internal.TEMP_RESPONSE_PREFIX,
			internal.SAVED_RESPONSES_PREFIX,
			internal.MAX_RESPONSE_LIMIT_BYTES,
			previewSrvAddr,
		),
		persistDir: appCfg.BaseSavedResponsesDir,
	}
}

func (we *WebExecutor) Startup(ctx context.Context, mimeDbJson []byte) error {
	log.Println("[WebExecutor] Initialization Started")

	//populate mime db if doesn't exist
	count, err := we.storage.MimeRepo.GetRecordCount(ctx)

	if err != nil {
		return err
	}

	if count == 0 {
		log.Println("[WebExecutor] no mime records found in the db, populating...")

		m, err := utils.LoadMimeDb(mimeDbJson)

		if err != nil {
			return err
		}

		err = we.storage.MimeRepo.BulkAddMimeRecords(ctx, m, 500)

		if err != nil {
			return err
		}
	}

	log.Println("[WebExecutor] Initialization Completed")

	return nil
}

func (we *WebExecutor) Shutdown() {
	log.Println("[WebExecutor] Shutdown started")

	log.Println("[WebExecutor] Shutdown Finished")
}

func (we *WebExecutor) SendHttpReq(ctx context.Context, r models.GurlReq, envId string) (*models.GurlRes, error) {

	env, err := we.storage.EnvRepo.GetEnvironmentById(ctx, envId)

	envData := ""

	if err == nil {
		envData = string(env.Data)
	}

	return we.httpExecutor.SendHttpReq(ctx, r, envData)
}

func (we *WebExecutor) CancelReq(id string) {
	we.httpExecutor.CancelReq(id)
}

func (we *WebExecutor) ParseCookieRaw(text string) ([]models.GurlKeyValItem, error) {
	return we.httpExecutor.ParseCookieRaw(text)
}

func (we *WebExecutor) GetSavedResponsesSrc(ctx context.Context, filename string) string {
	userId := utils.UserIdFromContext(ctx)
	return fmt.Sprintf("%s/%s/%s/%s", we.previewSrvAddr, userId, internal.SAVED_RESPONSES_PREFIX, filename)
}

func (we *WebExecutor) UploadWebTempFile(id string, data []byte) models.UploadWebTempFileRes {

	log.Println("[WebExecutor] Uploading Web temp file")

	tmpF, err := os.CreateTemp(we.persistDir, fmt.Sprintf("gurl-req-%s-*", id))

	if err != nil {
		return models.UploadWebTempFileRes{
			Success: false,
			ErrMsg:  "failed to create tmp file",
			Data:    "",
		}

	}

	defer tmpF.Close()

	log.Printf("[WebExecutor] Created temp file: %s\n", tmpF.Name())

	_, err = tmpF.Write(data)

	if err != nil {
		return models.UploadWebTempFileRes{
			Success: false,
			ErrMsg:  "failed to write data to tmp file",
			Data:    "",
		}
	}

	return models.UploadWebTempFileRes{
		Success: true,
		ErrMsg:  "",
		Data:    tmpF.Name(),
	}
}

func (we *WebExecutor) GetPreviewHandler() http.HandlerFunc {
	return we.httpExecutor.GetPreviewHandler()
}

func (we *WebExecutor) GetInterpolatedReq(ctx context.Context, r *models.GurlReq, envId string) (*models.GurlReq, error) {
	env, err := we.storage.EnvRepo.GetEnvironmentById(ctx, envId)

	if err == nil {
		return we.httpExecutor.InterpolateReq(r, string(env.Data))
	}

	return r, nil
}
