package api

import (
	"encoding/json"
	"gurl/shared/models"
	"log"
	"net/http"
)

func (api *Api) GetUIState(w http.ResponseWriter, r *http.Request) {
	uiState, err := api.storage.UiStateRepo.GetUIState(r.Context())

	if err != nil {
		log.Printf("[api/GetUIState] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to load ui state from db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, uiState))

}

func (api *Api) UpdateUIState(w http.ResponseWriter, r *http.Request) {

	var dto models.UpdateUIStateDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/UpdateUIState] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.UiStateRepo.UpdateUIState(dto)

	if err != nil {
		log.Printf("[api/UpdateUIState] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to update ui state in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}
