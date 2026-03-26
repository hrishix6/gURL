package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"gurl/shared/models"
	"log"
	"net/http"

	"gorm.io/gorm"
)

// envs
func (api *Api) GetEnvironments(w http.ResponseWriter, r *http.Request) {

	queryParams := r.URL.Query()

	workspaceId := queryParams.Get("workspace_id")

	envs, err := api.storage.EnvRepo.GetEnvironments(r.Context(), workspaceId)

	if err != nil {
		log.Printf("[api/GetEnvironments] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to load environments from db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, envs))
}

// TODO: REMOVE AS NOT BEING USED
func (api *Api) CreateEnvironment(w http.ResponseWriter, r *http.Request) {

	var dto models.AddEnvironmentDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/CreateEnvironment] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.EnvRepo.AddEnvironment(r.Context(), dto)

	if err != nil {
		log.Printf("[api/CreateEnvironment] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to create environment in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Created(w, api.WrapSuccessResponse(r, nil))

}

func (api *Api) CopyEnvironment(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")
	var dto models.CopyEnvironmentDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/CopyEnvironment] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.EnvRepo.CopyEnvironment(r.Context(), id, dto)

	if err != nil {
		log.Printf("[api/CopyEnvironment] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: fmt.Sprintf("failed to copy environment in db with id %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))

}

func (api *Api) DeleteEnvironment(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	err := api.storage.EnvRepo.RemoveEnv(r.Context(), id)

	if err != nil {
		log.Printf("[api/DeleteEnvironment] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: fmt.Sprintf("failed to delete environment with id: %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) DeleteEnvDraftsUnderEnv(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	err := api.storage.EnvRepo.DeleteEnvDraftsUnderEnv(r.Context(), id)

	if err != nil {
		log.Printf("[api/DeleteEnvDraftsUnderEnv] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: fmt.Sprintf("failed to delete env-drafts under env with id: %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

// env-drafts
func (api *Api) GetEnvDraftbyId(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	draft, err := api.storage.EnvRepo.FindEnvDraft(r.Context(), id)

	if err != nil {
		log.Printf("[api/GetEnvDraftbyId] error:%v \n", err)

		wrappedErr := &RequestError{
			Message: fmt.Sprintf("failed to env-draft with id %s from db", id),
			Details: err.Error(),
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			wrappedErr.Message = fmt.Sprintf("env-draft with id %s not found", id)
			wrappedErrResponse := api.WrapErrorResponse(r, wrappedErr)
			api.NotFound(w, wrappedErrResponse)
			return
		}

		wrappedErrResponse := api.WrapErrorResponse(r, wrappedErr)
		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, draft))
}

func (api *Api) CreateFreshEnvDraft(w http.ResponseWriter, r *http.Request) {

	var dto models.AddEnvironmentDraftDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/CreateFreshEnvDraft] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.EnvRepo.AddFreshEnvDraft(r.Context(), dto.DraftId)

	if err != nil {
		log.Printf("[api/CreateFreshEnvDraft] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to create fresh env-draft in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Created(w, api.WrapSuccessResponse(r, nil))

}

func (api *Api) SaveEnvDraftAsEnv(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	var dto models.SaveEnvDraftAsEnvDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/SaveEnvDraftAsEnv] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.EnvRepo.SaveEnvDraftAsEnv(r.Context(), id, dto)

	if err != nil {
		log.Printf("[api/SaveEnvDraftAsEnv] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to save env-draft as env in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Created(w, api.WrapSuccessResponse(r, nil))

}

func (api *Api) CreateEnvDraft(w http.ResponseWriter, r *http.Request) {

	var dto models.AddEnvironmentDraftDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/CreateEnvDraft] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.EnvRepo.AddEnvironmentDraft(r.Context(), dto)

	if err != nil {
		log.Printf("[api/CreateEnvDraft] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to create env-draft in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Created(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) DeleteEnvDraft(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")
	err := api.storage.EnvRepo.RemoveEnvDraft(r.Context(), id)

	if err != nil {
		log.Printf("[api/DeleteEnvDraft] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: fmt.Sprintf("failed to delete env-draft with id: %s", id),
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

func (api *Api) UpdateEnvDraft(w http.ResponseWriter, r *http.Request) {

	id := r.PathValue("id")

	var dto models.UpdateEnvDraftDataDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/UpdateEnvDraft] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "unable to parse body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.storage.EnvRepo.UpdateEnvDraftData(r.Context(), id, dto)

	if err != nil {
		log.Printf("[api/UpdateEnvDraft] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &RequestError{
			Message: "failed to update env-draft in db",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}
