package executor

import (
	"context"
	"fmt"
	"gurl/internal"
	dbPkg "gurl/internal/db"
	internalExec "gurl/internal/executor"
	importexport "gurl/internal/import_export"
	"gurl/internal/models"
	"gurl/internal/utils"
	"log"
	"os"
	"path/filepath"

	"gorm.io/gorm"
)

type WebExecutor struct {
	db             *gorm.DB
	mimeRepo       *dbPkg.MimeRepository
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

func NewWebExecutor(db *gorm.DB, appName string, tmpDir string, webTmpDir string) *WebExecutor {

	mimeRepo := dbPkg.NewMimeRepository(db)

	return &WebExecutor{
		db:             db,
		mimeRepo:       mimeRepo,
		previewSrvAddr: "",
		tmpDir:         tmpDir,
		httpExecutor:   internalExec.NewHttpExecutor(appName, tmpDir, mimeRepo),
		webTmpDir:      webTmpDir,
	}
}

func (we *WebExecutor) Startup(ctx context.Context, mimeDbJson []byte, previewSrvAddr string) error {
	log.Println("[WebExecutor] Initialization Started")

	//populate mime db if doesn't exist
	count, err := we.mimeRepo.GetRecordCount(ctx)

	if err != nil {
		return err
	}

	if count == 0 {
		log.Println("[WebExecutor] no mime records found in the db, populating...")

		m, err := utils.LoadMimeDb(mimeDbJson)

		if err != nil {
			return err
		}

		err = we.mimeRepo.BulkAddMimeRecords(ctx, m, 500)

		if err != nil {
			return err
		}
	}

	_ = CleanupWebTempDir(we.db, we.webTmpDir)

	log.Println("[WebExecutor] Cleaned up Web Temp Dir")

	we.previewSrvAddr = previewSrvAddr

	log.Printf("[WebExecutor] Preview Server Addr: %s", previewSrvAddr)

	we.httpExecutor.SetPreviewSrvAddr(previewSrvAddr)

	log.Println("[WebExecutor] Initialization Completed")

	return nil
}

func (we *WebExecutor) Shutdown() {
	log.Println("[WebExecutor] Shutdown started")

	log.Println("[WebExecutor] Cleaning up tmp directory started")
	_ = utils.CleanupTempDir(we.tmpDir)

	log.Println("[WebExecutor] Shutdown Finished")
}

func (we *WebExecutor) SendHttpReq(ctx context.Context, r models.GurlReq) (*models.GurlRes, error) {
	return we.httpExecutor.SendHttpReq(ctx, r)
}

func (we *WebExecutor) CancelReq(id string) {
	we.httpExecutor.CancelReq(id)
}

func (we *WebExecutor) ParseCookieRaw(text string) ([]models.GurlKeyValItem, error) {
	return we.httpExecutor.ParseCookieRaw(text)
}

func (we *WebExecutor) GetSavedResponsesSrc(savedResPath string) string {
	filename := filepath.Base(savedResPath)
	return fmt.Sprintf("%s%s%s", we.previewSrvAddr, internal.SAVED_RESPONSES_PREFIX, filename)
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
		Data:    tmpF.Name(),
	}
}
