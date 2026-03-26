package api

import (
	"encoding/json"
	"fmt"
	"gurl/shared/models"
	"log"
	"net/http"
)

func (api *Api) CreateReqExample(w http.ResponseWriter, r *http.Request) {

	var dto models.AddRequestExampleDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/CreateReqExample] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.ReqExampleRepo.AddReqExample(r.Context(), dto.Example, dto.RenderMetadata, api.storage.SavedResponsesDir)

	if err != nil {
		log.Printf("[api/CreateReqExample] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to create request-example",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Created(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) GetReqExampleById(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	example, err := api.storage.ReqExampleRepo.GetReqExampleById(r.Context(), id)

	if err != nil {
		log.Printf("[api/GetReqExampleById] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: fmt.Sprintf("failed to load request-example with id: %s from db", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, example))
}

func (api *Api) GetReqExamples(w http.ResponseWriter, r *http.Request) {

	queryParams := r.URL.Query()

	workspaceId := queryParams.Get("workspace_id")

	examples, err := api.storage.ReqExampleRepo.GetReqExamples(r.Context(), workspaceId)

	if err != nil {
		log.Printf("[api/GetReqExamples] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to load request-examples",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, examples))
}

func (api *Api) DeleteReqExample(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	err := api.storage.ReqExampleRepo.DeleteReqExample(r.Context(), id)

	if err != nil {
		log.Printf("[api/DeleteReqExample] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: fmt.Sprintf("failed to delete request-example with id: %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}
