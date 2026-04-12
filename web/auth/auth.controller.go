package auth

import (
	"encoding/json"
	"errors"
	"gurl/web/internal/config"
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
	appCfg *config.WebApplicationConfig,
	authSvc *AuthService,
) *AuthRouter {

	f, err := url.Parse(appCfg.FrontendURL)

	if err != nil {
		log.Fatalf("expected valid FE url: %v", err)
	}

	b, err := url.Parse(appCfg.BackendURL)

	if err != nil {
		log.Fatalf("expected valid BE url: %v", err)
	}

	mode := "local"

	if appCfg.Env == "PROD" {
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

func (api *AuthRouter) DemoSession(w http.ResponseWriter, r *http.Request) {

	err := r.ParseForm()
	if err != nil {
		log.Printf("/auth/demo-session body is bad failed %v\n", err)
		loginBaseURL := api.FrontendURL.JoinPath("login")
		q := loginBaseURL.Query()
		q.Add("code", "err_demo_session_fail")
		loginBaseURL.RawQuery = q.Encode()

		api.Redirect(w, loginBaseURL.String())
		return
	}

	token := r.FormValue("token")

	if token == "" {
		log.Printf("/auth/demo-session no token failed %v\n", err)
		loginBaseURL := api.FrontendURL.JoinPath("login")
		q := loginBaseURL.Query()
		q.Add("code", "err_demo_session_fail")
		loginBaseURL.RawQuery = q.Encode()

		api.Redirect(w, loginBaseURL.String())
		return
	}

	err = api.authSvc.VerifyCFTurnstileToken(r.Context(), token)

	if err != nil {
		log.Printf("/auth/demo-session turnstile verification failed %v\n", err)
		loginBaseURL := api.FrontendURL.JoinPath("login")
		q := loginBaseURL.Query()
		q.Add("code", "err_demo_session_fail")
		loginBaseURL.RawQuery = q.Encode()

		api.Redirect(w, loginBaseURL.String())
		return
	}

	demo_user_token, err := api.authSvc.DemoUserLogin(r.Context())

	if err != nil {
		log.Printf("/auth/demo-session failed to create demo user data %v\n", err)
		loginBaseURL := api.FrontendURL.JoinPath("login")
		q := loginBaseURL.Query()
		q.Add("code", "err_demo_session_fail")
		loginBaseURL.RawQuery = q.Encode()

		api.Redirect(w, loginBaseURL.String())
		return
	}

	cookie := api.authSvc.GenerateSessionCookie(api.mode, demo_user_token)

	http.SetCookie(w, &cookie)
	api.Redirect(w, api.FrontendURL.String())
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

	sessionCookie, err := api.authSvc.ExtractSessionCookie(r)

	if err == nil {
		api.authSvc.PurgeDemoUser(r.Context(), sessionCookie)
	}

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

	claims, err := api.authSvc.ParseToken(sessionCookie.Value)

	if err != nil {
		clearCookie := api.authSvc.ClearSessionCookie(api.mode)
		http.SetCookie(w, &clearCookie)
		api.WhoAreYou(w, api.WrapErrorResponse(r, models.RequestError{
			Message: "unauthorized",
			Details: "invalid or expired token",
		}))

		return
	}

	userInfo, err := api.authSvc.GetUserInfo(r.Context(), claims)

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
	authMux.Post("/demo-session", auth.DemoSession)

	return httpx.RequestContext(httpx.RequestLogger(authMux))
}
