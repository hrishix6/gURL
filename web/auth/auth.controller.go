package auth

import (
	"encoding/json"
	"errors"
	"gurl/web/internal/httpx"
	"gurl/web/internal/models"
	"log"
	"net/http"
)

type AuthRouter struct {
	isProduction bool
	httpx.BaseController
	authSvc *AuthService
}

func NewAuthRouter(
	authSvc *AuthService,
	isProd bool,
) *AuthRouter {
	return &AuthRouter{
		authSvc:      authSvc,
		isProduction: isProd,
	}
}

func (api *AuthRouter) Login(w http.ResponseWriter, r *http.Request) {

	var loginDto models.LoginRequestDTO

	err := json.NewDecoder(r.Body).Decode(&loginDto)

	if err != nil {
		log.Printf("[api/Login] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &models.RequestError{
			Message: "invalid credentials",
		})

		api.WhoAreYou(w, wrappedErrResponse)
		return
	}

	token, err := api.authSvc.TryLogin(r.Context(), loginDto)

	if err != nil {

		log.Printf("[api/Login] error:%v \n", err)

		if errors.Is(err, ErrAuthFailure) || errors.Is(err, ErrAuthTokenGenFailed) {
			wrappedErrResponse := api.WrapErrorResponse(r, &models.RequestError{
				Message: "failed to login",
				Details: err.Error(),
			})

			api.ServerCooked(w, wrappedErrResponse)
			return
		}

		if errors.Is(err, ErrAuthInvalidCredentials) {
			wrappedErrResponse := api.WrapErrorResponse(r, &models.RequestError{
				Message: "unauthorized",
				Details: err.Error(),
			})

			api.WhoAreYou(w, wrappedErrResponse)
			return
		}

		wrappedErrResponse := api.WrapErrorResponse(r, &models.RequestError{
			Message: "failed to login",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	sessionCookie := api.authSvc.GenerateSessionCookie(token, api.isProduction)

	http.SetCookie(w, &sessionCookie)

	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

func (api *AuthRouter) Register(w http.ResponseWriter, r *http.Request) {

	var dto models.RegisterDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/Register] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &models.RequestError{
			Message: "failed to parse request body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	log.Printf("New Sign up: %s, %s\n", dto.Username, dto.Email)
	err = api.authSvc.TryRegister(r.Context(), dto)

	if err != nil {
		log.Printf("[api/Register] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, &models.RequestError{
			Message: "failed to sign up",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Created(w, api.WrapSuccessResponse(r, nil))
}

func (api *AuthRouter) Logout(w http.ResponseWriter, r *http.Request) {
	clearCookie := api.authSvc.ClearSessionCookie(api.isProduction)
	http.SetCookie(w, &clearCookie)
	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

func (auth *AuthRouter) Routes() http.Handler {

	authMux := httpx.NewGurlWebRouter("")

	authMux.Post("/login", auth.Login)
	authMux.Post("/register", auth.Register)
	authMux.Post("/logout", auth.Logout)

	return httpx.RequestContext(httpx.RequestLogger(authMux))
}
