package api

import (
	"fmt"
	"gurl/shared/utils"
	"gurl/web/internal/models"
	"net/http"
)

func (api *Api) PreviewHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		userIdFromToken := utils.UserIdFromContext(r.Context())

		userIdFromPath := r.PathValue("id")

		if userIdFromToken != userIdFromPath {

			api.NoEntry(w, api.WrapErrorResponse(r, &models.RequestError{
				Message: "forbidden",
				Details: "you don't have permission to preview this content",
			}))

			return
		}

		nextHandler := http.StripPrefix(fmt.Sprintf("/preview/%s", userIdFromPath), next)
		nextHandler.ServeHTTP(w, r)
	})
}
