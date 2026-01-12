package executor

import (
	"context"
	"errors"
	"fmt"
	"gurl/executor/transform"
	"gurl/internal"
	"gurl/internal/db"
	"gurl/internal/models"
	"gurl/internal/utils"
	"log"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"gorm.io/gorm"
)

type Executor struct {
	db              *gorm.DB
	appCtx          context.Context
	cancelStore     *GurlReqContextStore
	httpClient      *http.Client
	httpTransformer *transform.HttpTransformer
	httpAgent       string
	tmpDir          string
	previewSrv      *http.Server
	previewSrvAddr  string
	cleanupWG       *sync.WaitGroup
}

func NewExecutor(db *gorm.DB, appName string, tmpDir string) *Executor {
	return &Executor{
		db:          db,
		cancelStore: NewGurlReqContextStore(),
		httpClient: &http.Client{
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				return http.ErrUseLastResponse
			},
			Timeout: 5 * time.Minute,
		},
		httpAgent: appName,
		tmpDir:    tmpDir,
		cleanupWG: &sync.WaitGroup{},
	}
}

func (e *Executor) bulkAddMimeRecords(m map[string]models.MimeData, batch int) error {

	records := []db.MimeRecord{}

	record := &db.MimeRecord{}

	for k, v := range m {
		records = append(records, record.FromJsonRecord(k, v))
	}

	if batch == 0 {
		batch = 20
	}

	return gorm.G[db.MimeRecord](e.db).CreateInBatches(e.appCtx, &records, batch)
}

func Startup(e *Executor, ctx context.Context, mimeDbJson []byte) error {
	log.Println("[Executor] Initialization Started")
	e.appCtx = ctx
	e.httpTransformer = transform.NewHttpTransformer(e.db, ctx)

	//populate mime db if doesn't exist
	count, err := gorm.G[db.MimeRecord](e.db).Count(e.appCtx, "id")

	if err != nil {
		return err
	}

	if count == 0 {
		log.Println("no mime records found in the db, populating...")

		m, err := utils.LoadMimeDb(mimeDbJson)

		if err != nil {
			return err
		}

		err = e.bulkAddMimeRecords(m, 500)

		if err != nil {
			return err
		}
	}

	//start a preview server for response preview
	listner, err := net.Listen("tcp", "127.0.0.1:0")

	log.Println("[Executor] Starting Preview HTTP server at ", listner.Addr().String())

	if err != nil {
		return err
	}

	e.previewSrv = NewPreviewServer(e.tmpDir)
	e.previewSrvAddr = fmt.Sprintf("http://%s", listner.Addr().String())

	e.cleanupWG.Add(1)

	go func() {
		defer e.cleanupWG.Done()

		if err := e.previewSrv.Serve(listner); !errors.Is(err, http.ErrServerClosed) {
			// unexpected error. port in use?
			log.Fatalf("Serve(): %v", err)
		}

		log.Println(`[Executor] Preview Server Shutdown finished`)
	}()

	log.Println("[Executor] Initialization Completed")

	return nil
}

func Shutdown(e *Executor, appCtx context.Context) {
	log.Println("[Executor] Shutdown started")

	log.Println("[Executor] Preview Server Shutdown started")
	e.previewSrv.Shutdown(appCtx)

	log.Println("[Executor] Cleaning up tmp directory started")
	_ = utils.CleanupTempDir(e.tmpDir)

	log.Println("[Executor] Finished cleaning up tmp directory")
	e.cleanupWG.Wait()

	log.Println("[Executor] Shutdown Finished")
}

func (e *Executor) SendHttpReq(r models.GurlReq) (*models.GurlRes, error) {

	ctx, cancelFunc := context.WithCancel(e.appCtx)

	e.cancelStore.AddReq(r.Id, cancelFunc)

	defer e.cancelStore.CancelReq(r.Id)

	log.Printf("[Executor] added req %s to cancel store\n", r.Id)

	req, err := e.httpTransformer.TransformToHttp(ctx, &r, e.httpAgent)

	if err != nil {
		return nil, err
	}

	start := time.Now()

	res, err := e.httpClient.Do(req)

	if err != nil {
		return nil, err
	}

	ttfbMs := time.Since(start).Milliseconds()

	log.Printf("[Executor] First byte received in %dms\n", ttfbMs)

	tempData, err := e.httpTransformer.TempStoreResponse(r.Id, res, e.tmpDir)

	if err != nil {
		return nil, err
	}

	responsePreviewBaseAddr := fmt.Sprintf("%s%s", e.previewSrvAddr, internal.SAVED_RESPONSES_PREFIX)

	gurlRes := e.httpTransformer.TransformHttpResponse(r.Id, req, res, ttfbMs, tempData, responsePreviewBaseAddr)

	log.Println("[Executor] Response preview is available at ", gurlRes.Body.Src)

	return gurlRes, nil
}

func (e *Executor) CancelReq(id string) {
	e.cancelStore.CancelReq(id)
}

func (e *Executor) ParseCookieRaw(text string) ([]models.GurlKeyValItem, error) {

	cookies, err := http.ParseCookie(text)

	if err != nil {
		return []models.GurlKeyValItem{}, err
	}

	var results []models.GurlKeyValItem

	for _, cookie := range cookies {

		results = append(results, models.GurlKeyValItem{
			Key:     cookie.Name,
			Value:   cookie.Value,
			Enabled: !strings.HasPrefix(cookie.Name, "#"),
		})

	}

	return results, nil
}
