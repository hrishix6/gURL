package api

import (
	"encoding/json"
	"gurl/shared/utils"
	"gurl/web/internal/models"
	"log"
	"net/http"
)

func (api *Api) AdminGuard(next http.HandlerFunc) http.HandlerFunc {

	return func(w http.ResponseWriter, r *http.Request) {

		adminUserId := utils.UserIdFromContext(r.Context())

		if adminUserId == "" {
			api.WhoAreYou(w, api.WrapErrorResponse(r, models.RequestError{
				Message: "invalid token",
			}))

			return
		}

		userId, err := api.storage.UserRepo.FindUserById(r.Context(), adminUserId)

		if err != nil {
			api.WhoAreYou(w, api.WrapErrorResponse(r, models.RequestError{
				Message: "invalid token",
			}))

			return
		}

		if !userId.IsAdmin {

			api.NoEntry(w, api.WrapErrorResponse(r, models.RequestError{
				Message: "forbidden",
				Details: "only admins have permission to do this",
			}))

			return
		}

		next.ServeHTTP(w, r)
	}

}

func (api *Api) InviteUser(w http.ResponseWriter, r *http.Request) {

	var dto models.RegisterDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/InviteUser] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, models.RequestError{
			Message: "failed to parse request body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.authSvc.InviteUser(r.Context(), api.domainURL, dto.Email)

	if err != nil {
		log.Printf("[api/InviteUser] error:%v \n", err)

		api.ServerCooked(w, api.WrapErrorResponse(r, models.RequestError{
			Message: "failed to invite user",
		}))
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, "Ok"))
}
