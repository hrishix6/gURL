package executor

import (
	"context"
	"fmt"
	dbPkg "gurl/shared/db"
	internalExec "gurl/shared/executor"
	importexport "gurl/shared/import_export"
	"gurl/shared/models"
	"gurl/shared/utils"
	"gurl/web/internal"
	"gurl/web/internal/config"
	"gurl/web/storage"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"gorm.io/gorm"
)

type WebExecutor struct {
	storage        *storage.WebStorage
	httpExecutor   *internalExec.HttpExecutor
	previewSrvAddr string
	tmpDir         string
	webTmpDir      string
}

func CleanupWebTempDir(dbConn *gorm.DB, webTempDir string) error {

	storedFiles := map[string]struct{}{}

	entries, err := os.ReadDir(webTempDir)

	if err != nil {
		return err
	}

	for _, entry := range entries {
		path := filepath.Join(webTempDir, entry.Name())
		storedFiles[path] = struct{}{}
	}

	storedEntries := map[string]struct{}{}

	reqs, err := gorm.G[dbPkg.Request](dbConn).Find(context.Background())

	if err != nil {
		return err
	}

	for _, req := range reqs {
		if string(req.BinaryBody) != "" {

			path := importexport.ToExportedBinaryBody(req.BinaryBody)

			if path == "" {
				continue
			}

			storedEntries[path] = struct{}{}
		}

		if string(req.MultipartForm) != "" {

			items := importexport.ToExportedMultipartItem(req.MultipartForm)

			for _, item := range items {

				if item.IsFile {
					storedEntries[item.V] = struct{}{}
				}
			}
		}
	}

	drafts, err := gorm.G[dbPkg.RequestDraft](dbConn).Find(context.Background())

	if err != nil {
		return err
	}

	for _, draft := range drafts {
		if string(draft.BinaryBody) != "" {

			path := importexport.ToExportedBinaryBody(draft.BinaryBody)

			if path == "" {
				continue
			}

			storedEntries[path] = struct{}{}
		}

		if string(draft.MultipartForm) != "" {

			items := importexport.ToExportedMultipartItem(draft.MultipartForm)

			for _, item := range items {

				if item.IsFile {
					storedEntries[item.V] = struct{}{}
				}
			}
		}
	}

	for k := range storedFiles {

		_, ok := storedEntries[k]

		if !ok {
			err := os.RemoveAll(k)

			if err != nil {
				log.Printf("failed to remove temp web file %s\n", k)
				continue
			}

			log.Printf("removed unused web temp file %s\n", k)
		}
	}

	return nil
}

func NewWebExecutor(
	appCfg *config.WebApplicationConfig,
	storage *storage.WebStorage,
) *WebExecutor {
	return &WebExecutor{
		storage:        storage,
		previewSrvAddr: "",
		tmpDir:         appCfg.BaseTmpDir,
		httpExecutor: internalExec.NewHttpExecutor(
			appCfg.AppName,
			appCfg.BaseTmpDir,
			appCfg.BaseSavedResponsesDir,
			storage.MimeRepo,
			internal.TEMP_RESPONSE_PREFIX,
			internal.SAVED_RESPONSES_PREFIX,
			internal.MAX_RESPONSE_LIMIT_BYTES,
		),
		webTmpDir: appCfg.BaseUploadsDir,
	}
}

func (we *WebExecutor) Startup(ctx context.Context, mimeDbJson []byte, previewSrvAddr string) error {
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

	we.previewSrvAddr = previewSrvAddr

	log.Printf("[WebExecutor] Preview Server Addr: %s", previewSrvAddr)

	we.httpExecutor.SetPreviewSrvAddr(previewSrvAddr)

	log.Println("[WebExecutor] Initialization Completed")

	return nil
}

func (we *WebExecutor) Shutdown() {
	log.Println("[WebExecutor] Shutdown started")

	log.Println("[WebExecutor] Shutdown Finished")
}

func (we *WebExecutor) SendHttpReq(ctx context.Context, r models.GurlReq) (*models.GurlRes, error) {
	//In Web client for multipart bodies, Filepath is only file name, this is by design to not expose file system to web client side
	//frontend will only pass temp file name that was uploaded, we append temp uploads directory path before passing it to executor.
	if r.BodyType == "multipart" && len(r.MultiPartForm) > 0 {

		for i := range r.MultiPartForm {
			if r.MultiPartForm[i].IsFile {
				r.MultiPartForm[i].Value = filepath.Join(we.webTmpDir, r.MultiPartForm[i].Value)
			}
		}
	}

	if r.BodyType == "binary" && r.BinaryFile != "" {
		r.BinaryFile = filepath.Join(we.webTmpDir, r.BinaryFile)
	}

	return we.httpExecutor.SendHttpReq(ctx, r)
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

	tmpF, err := os.CreateTemp(we.webTmpDir, fmt.Sprintf("gurl-%s-*", id))

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
		Data:    filepath.Base(tmpF.Name()),
	}
}

func (we *WebExecutor) GetPreviewHandler() http.HandlerFunc {
	return we.httpExecutor.GetPreviewHandler()
}
