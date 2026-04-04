package httpx

import (
	"encoding/json"
	"gurl/web/internal/models"
	"net/http"
	"time"
)

type BaseController struct {
}

func (a *BaseController) json(v any) []byte {
	bytes, err := json.Marshal(v)

	if err != nil {
		panic(err)
	}

	return bytes
}

func (a *BaseController) Ok(w http.ResponseWriter, payload any) {
	w.Header().Set("content-type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	w.Write(a.json(payload))
}

func (a *BaseController) Bad(w http.ResponseWriter, payload any) {
	w.Header().Set("content-type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusBadRequest)
	w.Write(a.json(payload))
}

func (a *BaseController) Created(w http.ResponseWriter, payload any) {
	w.Header().Set("content-type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusCreated)
	w.Write(a.json(payload))
}

func (a *BaseController) NoEntry(w http.ResponseWriter, payload any) {
	w.Header().Set("content-type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusForbidden)
	w.Write(a.json(payload))
}

func (a *BaseController) NotFound(w http.ResponseWriter, payload any) {
	w.Header().Set("content-type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusNotFound)
	w.Write(a.json(payload))
}

func (a *BaseController) WhoAreYou(w http.ResponseWriter, payload any) {
	w.Header().Set("content-type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusUnauthorized)
	w.Write(a.json(payload))
}

func (a *BaseController) ServerCooked(w http.ResponseWriter, payload any) {
	w.Header().Set("content-type", "application/json; charset=utf-8")
	w.WriteHeader(http.StatusInternalServerError)
	w.Write(a.json(payload))
}

func (a *BaseController) Redirect(w http.ResponseWriter, redirectURL string) {
	w.Header().Set("Location", redirectURL)
	w.WriteHeader(http.StatusFound)
}

func (a *BaseController) WrapSuccessResponse(r *http.Request, payload any) models.ApiSuccessResponse {

	reqId, _ := ReqIdFromCtx(r.Context())

	return models.ApiSuccessResponse{
		Success: true,
		Data:    payload,
		MetaData: models.ReqMetadata{
			Timestamp: time.Now(),
			RequestId: reqId,
		},
	}
}

func (a *BaseController) WrapErrorResponse(r *http.Request, error models.RequestError) models.ApiErrorResponse {

	reqId, _ := ReqIdFromCtx(r.Context())

	return models.ApiErrorResponse{
		Success: false,
		Error:   error,
		MetaData: models.ReqMetadata{
			Timestamp: time.Now(),
			RequestId: reqId,
		},
	}

}
