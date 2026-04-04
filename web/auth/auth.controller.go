package auth

import (
	"encoding/json"
	"errors"
	"gurl/web/internal/httpx"
	"gurl/web/internal/models"
	"log"
	"net/http"
	"net/url"
)

type AuthRouter struct {
	FrontendURL *url.URL
	BackendURL  *url.URL
	mode        string
	httpx.BaseController
	authSvc *AuthService
}

func NewAuthRouter(
	frontendURL string,
	backendURL string,
	authSvc *AuthService,
	isProd bool,
) *AuthRouter {

	f, err := url.Parse(frontendURL)

	if err != nil {
		log.Fatalf("expected valid FE url: %v", err)
	}

	b, err := url.Parse(backendURL)

	if err != nil {
		log.Fatalf("expected valid BE url: %v", err)
	}

	mode := "local"

	if isProd {
		mode = "prod"
	}

	return &AuthRouter{
		FrontendURL: f,
		BackendURL:  b,
		authSvc:     authSvc,
		mode:        mode,
	}
}

func (api *AuthRouter) Login(w http.ResponseWriter, r *http.Request) {

	var loginDto models.LoginRequestDTO

	err := json.NewDecoder(r.Body).Decode(&loginDto)

	if err != nil {
		log.Printf("[api/Login] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, models.RequestError{
			Message: "invalid request payload",
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	magicLink := api.authSvc.TryLogin(r.Context(), api.BackendURL, loginDto)

	if api.mode == "prod" {
		api.Ok(w, api.WrapSuccessResponse(r, "Ok"))
		return
	}

	if magicLink != "" {
		api.Ok(w, api.WrapSuccessResponse(r, magicLink))
		return
	}

	api.ServerCooked(w, api.WrapErrorResponse(r, models.RequestError{
		Message: "no magic link generated",
	}))

}

func (api *AuthRouter) RegisterAdmin(w http.ResponseWriter, r *http.Request) {

	var dto models.RegisterDTO

	err := json.NewDecoder(r.Body).Decode(&dto)

	if err != nil {
		log.Printf("[api/RegisterAdmin] error:%v \n", err)
		wrappedErrResponse := api.WrapErrorResponse(r, models.RequestError{
			Message: "failed to parse request body",
			Details: err.Error(),
		})

		api.Bad(w, wrappedErrResponse)
		return
	}

	err = api.authSvc.TryRegisterAdmin(r.Context(), dto)

	if err != nil {

		log.Printf("[api/RegisterAdmin] error:%v \n", err)

		if errors.Is(err, ErrAlreadyConfigured) {

			wrappedErrResponse := api.WrapErrorResponse(r, models.RequestError{
				Message: "not allowed",
				Details: err.Error(),
			})

			api.NoEntry(w, wrappedErrResponse)
			return
		}

		wrappedErrResponse := api.WrapErrorResponse(r, models.RequestError{
			Message: "failed to register admin user",
			Details: err.Error(),
		})

		api.ServerCooked(w, wrappedErrResponse)
		return
	}

	api.Created(w, api.WrapSuccessResponse(r, nil))
}

func (api *AuthRouter) Logout(w http.ResponseWriter, r *http.Request) {

	clearCookie := api.authSvc.ClearSessionCookie(api.mode)
	http.SetCookie(w, &clearCookie)
	api.Ok(w, api.WrapSuccessResponse(r, nil))
}

func (api *AuthRouter) Check(w http.ResponseWriter, r *http.Request) {

	sessionCookie, err := api.authSvc.ExtractSessionCookie(r)

	if err != nil {
		api.WhoAreYou(w, api.WrapErrorResponse(r, models.RequestError{
			Message: "unauthorized",
			Details: "missing session cookie",
		}))

		return
	}

	userid, err := api.authSvc.ParseToken(sessionCookie.Value)

	if err != nil {
		clearCookie := api.authSvc.ClearSessionCookie(api.mode)
		http.SetCookie(w, &clearCookie)
		api.WhoAreYou(w, api.WrapErrorResponse(r, models.RequestError{
			Message: "unauthorized",
			Details: "invalid or expired token",
		}))

		return
	}

	userInfo, err := api.authSvc.GetUserInfo(r.Context(), userid)

	if err != nil {
		clearCookie := api.authSvc.ClearSessionCookie(api.mode)
		http.SetCookie(w, &clearCookie)
		api.WhoAreYou(w, api.WrapErrorResponse(r, models.RequestError{
			Message: "unauthorized",
			Details: "invalid or expired token",
		}))

		return
	}

	api.Ok(w, api.WrapSuccessResponse(r, userInfo))
}

func (api *AuthRouter) EmailCallback(w http.ResponseWriter, r *http.Request) {

	token := r.URL.Query().Get("token")

	loginBaseURL := api.FrontendURL.JoinPath("login")

	if token == "" {
		q := loginBaseURL.Query()
		q.Add("code", "err_link_invalid")
		loginBaseURL.RawQuery = q.Encode()

		api.Redirect(w, loginBaseURL.String())
		return
	}

	sessionToken, err := api.authSvc.ValidateMagicLink(r.Context(), token)

	if err != nil {
		q := loginBaseURL.Query()
		q.Add("code", "err_link_expired")
		loginBaseURL.RawQuery = q.Encode()
		api.Redirect(w, loginBaseURL.String())
		return
	}

	sessionCookie := api.authSvc.GenerateSessionCookie(api.mode, sessionToken)

	http.SetCookie(w, &sessionCookie)
	api.Redirect(w, api.FrontendURL.String())
}

func (auth *AuthRouter) Routes() http.Handler {

	authMux := httpx.NewGurlWebRouter("")

	authMux.Get("/check", auth.Check)
	authMux.Post("/login", auth.Login)
	authMux.Get("/email.callback", auth.EmailCallback)
	authMux.Post("/register/admin", auth.RegisterAdmin)
	authMux.Post("/logout", auth.Logout)

	return httpx.RequestContext(httpx.RequestLogger(authMux))
}
