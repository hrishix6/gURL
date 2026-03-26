package executor

import (
	"context"
	"errors"
	"fmt"
	"gurl/internal"
	dbPkg "gurl/internal/db"
	httpExecutor "gurl/internal/executor"
	"gurl/internal/models"
	"gurl/internal/utils"
	"log"
	"net"
	"net/http"
	"path/filepath"
	"sync"

	"gorm.io/gorm"
)

type DesktopExecutor struct {
	db             *gorm.DB
	appCtx         context.Context
	mimeRepo       *dbPkg.MimeRepository
	httpExecutor   *httpExecutor.HttpExecutor
	savedResDir    string
	previewSrv     *http.Server
	cleanupWG      *sync.WaitGroup
	tmpDir         string
	previewSrvAddr string
}

func NewExecutor(db *gorm.DB, appName string, tmpDir string, savedResponsesDir string) DesktopExecutor {
	mimeRepo := dbPkg.NewMimeRepository(db)
	return DesktopExecutor{
		mimeRepo:     mimeRepo,
		httpExecutor: httpExecutor.NewHttpExecutor(appName, tmpDir, mimeRepo),
		savedResDir:  savedResponsesDir,
		cleanupWG:    &sync.WaitGroup{},
		tmpDir:       tmpDir,
	}
}

func Startup(e *DesktopExecutor, ctx context.Context, mimeDbJson []byte) error {
	log.Println("[DesktopExecutor] Initialization Started")
	e.appCtx = ctx

	//populate mime db if doesn't exist
	count, err := e.mimeRepo.GetRecordCount(e.appCtx)

	if err != nil {
		return err
	}

	if count == 0 {
		log.Println("no mime records found in the db, populating...")

		m, err := utils.LoadMimeDb(mimeDbJson)

		if err != nil {
			return err
		}

		err = e.mimeRepo.BulkAddMimeRecords(e.appCtx, m, 500)

		if err != nil {
			return err
		}
	}

	//start a preview server for response preview
	listner, err := net.Listen("tcp", "127.0.0.1:0")

	log.Println("[DesktopExecutor] Starting Preview HTTP server at ", listner.Addr().String())

	if err != nil {
		return err
	}

	e.previewSrv = NewPreviewServer(e.tmpDir, e.savedResDir)
	previewSrvAddr := fmt.Sprintf("http://%s", listner.Addr().String())
	e.previewSrvAddr = previewSrvAddr
	e.httpExecutor.SetPreviewSrvAddr(previewSrvAddr)

	e.cleanupWG.Add(1)

	go func() {
		defer e.cleanupWG.Done()

		if err := e.previewSrv.Serve(listner); !errors.Is(err, http.ErrServerClosed) {
			log.Fatalf("Serve(): %v", err)
		}

		log.Println(`[DesktopExecutor] Preview Server Shutdown finished`)
	}()

	log.Println("[DesktopExecutor] Initialization Completed")

	return nil
}

func Shutdown(e *DesktopExecutor, appCtx context.Context) {
	log.Println("[DesktopExecutor] Shutdown started")

	log.Println("[DesktopExecutor] Preview Server Shutdown started")
	e.previewSrv.Shutdown(appCtx)

	log.Println("[DesktopExecutor] Cleaning up tmp directory started")
	_ = utils.CleanupTempDir(e.tmpDir)

	log.Println("[DesktopExecutor] Finished cleaning up tmp directory")
	e.cleanupWG.Wait()

	log.Println("[DesktopExecutor] Shutdown Finished")
}

func (e *DesktopExecutor) SendHttpReq(r models.GurlReq) (*models.GurlRes, error) {
	return e.httpExecutor.SendHttpReq(e.appCtx, r)
}

func (e *DesktopExecutor) CancelReq(id string) {
	e.httpExecutor.CancelReq(id)
}

func (e *DesktopExecutor) ParseCookieRaw(text string) ([]models.GurlKeyValItem, error) {
	return e.httpExecutor.ParseCookieRaw(text)
}

func (e *DesktopExecutor) GetSavedResponsesSrc(savedResPath string) string {
	filename := filepath.Base(savedResPath)
	return fmt.Sprintf("%s%s%s", e.previewSrvAddr, internal.SAVED_RESPONSES_PREFIX, filename)
}
