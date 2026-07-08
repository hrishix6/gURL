package executor

import (
	"context"
	"fmt"
	"gurl/desktop/internal"
	dbPkg "gurl/shared/db"
	httpExecutor "gurl/shared/executor"
	"gurl/shared/models"
	"gurl/shared/utils"
	"log"
	"net/http"
	"path/filepath"
	"strings"

	"gorm.io/gorm"
)

type DesktopExecutor struct {
	db             *gorm.DB
	appCtx         context.Context
	mimeRepo       *dbPkg.MimeRepository
	reqRepo        *dbPkg.RequestRepository
	envRepo        *dbPkg.EnvironmentRepository
	HttpExecutor   *httpExecutor.HttpExecutor
	savedResDir    string
	tmpDir         string
	previewSrvAddr string
}

func NewExecutor(
	db *gorm.DB,
	appName string,
	tmpDir string,
	savedResponsesDir string,
) DesktopExecutor {
	mimeRepo := dbPkg.NewMimeRepository(db)
	previewSrvAddr := fmt.Sprintf("http://localhost:%d/preview", internal.SERVER_PORT)

	return DesktopExecutor{
		previewSrvAddr: previewSrvAddr,
		mimeRepo:       mimeRepo,
		reqRepo:        dbPkg.NewRequestRepository(db),
		envRepo:        dbPkg.NewEnvironmentRepository(db),
		HttpExecutor:   httpExecutor.NewHttpExecutor(appName, tmpDir, savedResponsesDir, mimeRepo, internal.TEMP_RESPONSE_PREFIX, internal.SAVED_RESPONSES_PREFIX, internal.MAX_RESPONSE_LIMIT_BYTES, previewSrvAddr),
		savedResDir:    savedResponsesDir,
		tmpDir:         tmpDir,
	}
}

func ExecutorCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		origin := r.Header.Get("Origin")

		if strings.HasPrefix(origin, "wails://") {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func Startup(e *DesktopExecutor, ctx context.Context, mimeDbJson []byte, mux *http.ServeMux) error {
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

	previewHandler := e.HttpExecutor.GetPreviewHandler()

	userId := utils.UserIdFromContext(e.appCtx)

	mux.Handle("/preview/{id}/", ExecutorCORS(PreviewUserPrefix(previewHandler, userId)))

	log.Println("[DesktopExecutor] Initialization Completed")

	return nil
}

func Shutdown(e *DesktopExecutor, appCtx context.Context) {
	log.Println("[DesktopExecutor] Shutdown started")

	log.Println("[DesktopExecutor] Shutdown Finished")
}

func (e *DesktopExecutor) SendHttpReq(r models.GurlReq, envId string) (*models.GurlRes, error) {

	env, err := e.envRepo.GetEnvironmentById(e.appCtx, envId)

	envData := ""

	if err == nil {
		envData = string(env.Data)
	}

	res, err := e.HttpExecutor.SendHttpReq(e.appCtx, r, envData)

	if err != nil {
		return nil, err
	}

	tempPath := filepath.Join(e.tmpDir, res.Body.Filename)

	err = e.reqRepo.UpdateDraftFields(e.appCtx, r.Id, models.UpdateDraftFieldsDTO{
		LastTmpResponsePath: &tempPath,
	})

	if err != nil {
		return nil, err
	}

	return res, nil
}

func (e *DesktopExecutor) GetInterpolatedReq(r models.GurlReq, envId string) (*models.GurlReq, error) {

	env, err := e.envRepo.GetEnvironmentById(e.appCtx, envId)

	if err == nil {
		return e.HttpExecutor.InterpolateReq(&r, string(env.Data))
	}

	return &r, nil
}

func (e *DesktopExecutor) CancelReq(id string) {
	e.HttpExecutor.CancelReq(id)
}

func (e *DesktopExecutor) ParseCookieRaw(text string) ([]models.GurlKeyValItem, error) {
	return e.HttpExecutor.ParseCookieRaw(text)
}

func (e *DesktopExecutor) GetSavedResponsesSrc(fileName string) string {
	userId := utils.UserIdFromContext(e.appCtx)
	return fmt.Sprintf("%s/%s/%s/%s", e.previewSrvAddr, userId, internal.SAVED_RESPONSES_PREFIX, fileName)
}
