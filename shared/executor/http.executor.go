package executor

import (
	"context"
	"fmt"
	"gurl/shared/db"
	"gurl/shared/executor/transform"
	"gurl/shared/models"
	"log"
	"net/http"
	"strings"
	"time"
)

type HttpExecutor struct {
	cancelStore      *GurlReqContextStore
	httpClient       *http.Client
	httpTransformer  *transform.HttpTransformer
	httpAgent        string
	tmpDir           string
	savedResDir      string
	previewSrvAddr   string
	TEMP_RES_PREFIX  string
	SAVED_RES_PREFIX string
}

func NewHttpExecutor(
	appName string,
	tmpDir string,
	savedResDir string,
	mimeRepo *db.MimeRepository,
	tempResponsePrefix string,
	savedResponsePrefix string,
	maxResponseBytesLimit int64,
) *HttpExecutor {
	contextStore := NewGurlReqContextStore()

	return &HttpExecutor{
		cancelStore: &contextStore,
		httpClient: &http.Client{
			CheckRedirect: func(req *http.Request, via []*http.Request) error {
				return http.ErrUseLastResponse
			},
			Timeout: 5 * time.Minute,
		},
		httpTransformer:  transform.NewHttpTransformer(mimeRepo, maxResponseBytesLimit),
		httpAgent:        appName,
		tmpDir:           tmpDir,
		savedResDir:      savedResDir,
		TEMP_RES_PREFIX:  tempResponsePrefix,
		SAVED_RES_PREFIX: savedResponsePrefix,
	}
}

func (e *HttpExecutor) SetPreviewSrvAddr(addr string) {
	e.previewSrvAddr = addr

	log.Printf("[HttpExecutor] Preview Server Addr: %s \n", e.previewSrvAddr)
}

func (e *HttpExecutor) SendHttpReq(ctx context.Context, r models.GurlReq) (*models.GurlRes, error) {

	wrappedCtx, cancelFunc := context.WithCancel(ctx)

	e.cancelStore.AddReq(r.Id, cancelFunc)

	defer e.cancelStore.CancelReq(r.Id)

	log.Printf("[HttpExecutor] added req %s to cancel store\n", r.Id)

	req, err := e.httpTransformer.TransformToHttp(wrappedCtx, &r, e.httpAgent)

	if err != nil {
		return nil, err
	}

	start := time.Now()

	res, err := e.httpClient.Do(req)

	if err != nil {
		return nil, err
	}

	ttfbMs := time.Since(start).Milliseconds()

	log.Printf("[HttpExecutor] First byte received in %dms\n", ttfbMs)

	tempData, err := e.httpTransformer.TempStoreResponse(ctx, r.Id, res, e.tmpDir)

	if err != nil {
		return nil, err
	}

	responsePreviewBaseAddr := fmt.Sprintf("%s%s", e.previewSrvAddr, e.TEMP_RES_PREFIX)

	gurlRes := e.httpTransformer.TransformHttpResponse(r.Id, req, res, ttfbMs, tempData, responsePreviewBaseAddr)

	log.Println("[HttpExecutor] Response preview is available at ", gurlRes.Body.Src)

	return gurlRes, nil
}

func (e *HttpExecutor) CancelReq(id string) {
	e.cancelStore.CancelReq(id)
	log.Printf("[HttpExecutor] request id %s cancelled\n", id)
}

func (e *HttpExecutor) ParseCookieRaw(text string) ([]models.GurlKeyValItem, error) {

	cookies, err := http.ParseCookie(text)

	if err != nil {
		return []models.GurlKeyValItem{}, err
	}

	var results []models.GurlKeyValItem

	isEnabled := func(v string) string {
		disabled := strings.HasPrefix(v, "#")

		if disabled {
			return "off"
		}

		return "on"
	}

	for _, cookie := range cookies {

		results = append(results, models.GurlKeyValItem{
			Key:     cookie.Name,
			Value:   cookie.Value,
			Enabled: isEnabled(cookie.Name),
		})

	}

	return results, nil
}

func (e *HttpExecutor) GetPreviewHandler() http.HandlerFunc {

	tmpFileServer := http.FileServer(http.Dir(e.tmpDir))
	savedResFileServer := http.FileServer(http.Dir(e.savedResDir))

	log.Printf("[Executor] is serving temp responses from : %s, temp prefix %s", e.tmpDir, e.TEMP_RES_PREFIX)
	log.Printf("[Executor] is serving saved responses from : %s, saved prefix %s", e.savedResDir, e.SAVED_RES_PREFIX)

	previewHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println("[Executor] Preview handler hit:", r.URL.Path)

		if !(strings.HasPrefix(r.URL.Path, e.SAVED_RES_PREFIX) || strings.HasPrefix(r.URL.Path, e.TEMP_RES_PREFIX)) {
			http.NotFound(w, r)
			return
		}

		if strings.HasPrefix(r.URL.Path, e.SAVED_RES_PREFIX) {
			http.StripPrefix(e.SAVED_RES_PREFIX, savedResFileServer).ServeHTTP(w, r)
			return
		}

		if strings.HasPrefix(r.URL.Path, e.TEMP_RES_PREFIX) {
			http.StripPrefix(e.TEMP_RES_PREFIX, tmpFileServer).ServeHTTP(w, r)
			return
		}
	})

	return previewHandler
}
