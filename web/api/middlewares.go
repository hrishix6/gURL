package api

import (
	"context"
	"gurl/internal/nanoid"
	"log"
	"net/http"
	"time"
)

type requestIdKey int

const (
	requestId requestIdKey = iota
)

func RequestContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reqId := nanoid.Must()
		r = r.WithContext(ContextWithReqId(r.Context(), reqId))
		next.ServeHTTP(w, r)
	})
}

func ContextWithReqId(ctx context.Context, reqId string) context.Context {
	return context.WithValue(ctx, requestId, reqId)
}

func ReqIdFromCtx(ctx context.Context) (string, bool) {
	v, b := ctx.Value(requestId).(string)
	return v, b
}

type ResponseRecorder struct {
	http.ResponseWriter
	Code int
}

func (rr *ResponseRecorder) WriteHeader(code int) {
	rr.Code = code
	rr.ResponseWriter.WriteHeader(code)
}

func (rr *ResponseRecorder) Write(b []byte) (int, error) {
	return rr.ResponseWriter.Write(b)
}

func RequestLogger(next http.Handler) http.Handler {

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		recorder := &ResponseRecorder{
			ResponseWriter: w,
		}

		start := time.Now()

		next.ServeHTTP(recorder, r)

		url, method := r.URL, r.Method

		reqId, ok := ReqIdFromCtx(r.Context())

		if !ok {
			reqId = ""
		}

		duration := time.Since(start).Abs().Milliseconds()

		log.Printf("[RequestLogger] #Id: %s | %s @ %s | Status %d %dms\n", reqId, method, url.String(), recorder.Code, duration)
	})

}
