package auth

import (
	"context"
	"fmt"
	internalModels "gurl/shared/models"
	"gurl/shared/nanoid"
	"gurl/shared/utils"
	"gurl/web/internal"
	"gurl/web/internal/emailx"
	"gurl/web/internal/models"
	"gurl/web/storage"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/go-jose/go-jose/v4"
	"github.com/go-jose/go-jose/v4/jwt"
)

var (
	ErrAuthInvalidCredentials = fmt.Errorf("invalid credentials")
	ErrAuthTokenGenFailed     = fmt.Errorf("failed to generate token")
	ErrAuthFailure            = fmt.Errorf("auth system failed")
	ErrAlreadyConfigured      = fmt.Errorf("admin user already configured")
)

type AuthService struct {
	secret            string
	mode              string
	issuer            string
	audience          string
	sessionCookieName string
	csrfCookieName    string
	storage           *storage.WebStorage
	mailer            *emailx.Mailer
	cfTurnstileSecret string
}

type GurlJwtClaims struct {
	jwt.Claims
	UserId string `json:"user_id"`
}

func NewAuthService(
	appName string,
	isProd bool,
	jwtSecret string,
	cfTurnstileSecret string,
	storage *storage.WebStorage,
	mailer *emailx.Mailer,
) *AuthService {

	mode := "prod"

	if !isProd {
		mode = "local"
	}
	return &AuthService{
		secret:            jwtSecret,
		mode:              mode,
		issuer:            fmt.Sprintf("%s-jwt-issuer", appName),
		audience:          fmt.Sprintf("%s-%s", appName, "web-client"),
		sessionCookieName: "_gurl_session_",
		csrfCookieName:    "_gurl_csrf_",
		storage:           storage,
		mailer:            mailer,
		cfTurnstileSecret: cfTurnstileSecret,
	}
}

func (authSvc *AuthService) VerifyCFTurnstileToken(ctx context.Context, token string) error {
	f := url.Values{}
	f.Add("secret", authSvc.cfTurnstileSecret)
	f.Add("response", token)

	req, err := http.NewRequestWithContext(ctx, "POST", internal.CF_TURNSTILE_CHALLENGE_URL, strings.NewReader(f.Encode()))

	if err != nil {
		log.Printf("cf verify error : %v\n", err)
		return err
	}

	req.Header.Set("content-type", "application/x-www-form-urlencoded")
	res, err := http.DefaultClient.Do(req)

	if !(res.StatusCode >= 200 && res.StatusCode <= 299) {
		return fmt.Errorf("cf verification failed")
	}

	return nil
}

func (authSvc *AuthService) generateToken(userId string, expiry time.Time) (string, error) {

	signer, err := jose.NewSigner(jose.SigningKey{Algorithm: jose.HS256, Key: []byte(authSvc.secret)}, nil)

	if err != nil {
		return "", err
	}

	cl := GurlJwtClaims{
		Claims: jwt.Claims{
			Issuer: authSvc.issuer,
			Audience: jwt.Audience{
				authSvc.audience,
			},
			Expiry:   jwt.NewNumericDate(expiry),
			IssuedAt: jwt.NewNumericDate(time.Now()),
		},
		UserId: userId,
	}

	raw, err := jwt.Signed(signer).Claims(cl).Serialize()

	if err != nil {
		return "", err
	}

	return raw, nil
}

func (authSvc *AuthService) ParseToken(token string) (*GurlJwtClaims, error) {

	parsed, err := jwt.ParseSigned(token, []jose.SignatureAlgorithm{jose.HS256})

	if err != nil {
		log.Printf("jwt_parse_err: %v\n", err)
		return nil, err
	}

	cl := GurlJwtClaims{}

	if err := parsed.Claims([]byte(authSvc.secret), &cl); err != nil {
		log.Printf("jwt_parse_err: %v\n", err)
		return nil, err
	}

	if err := cl.Validate(jwt.Expected{
		Issuer: authSvc.issuer,
		Time:   time.Now(),
		AnyAudience: jwt.Audience{
			authSvc.audience,
		},
	}); err != nil {
		log.Printf("jwt_parse_err: %v\n", err)
		return nil, err
	}

	if cl.UserId == "" {
		log.Printf("userid is null in jwt \n")
		return nil, fmt.Errorf("user_id is null in claims")
	}

	return &cl, nil
}

func (authSvc *AuthService) DemoUserLogin(ctx context.Context) (string, error) {
	id := nanoid.Must()

	newDemoUserId := fmt.Sprintf("%s_%s", internal.DEMO_USER_ID_PREFIX, id)
	newDemoUserWorkspaceId := fmt.Sprintf("%s_%s", internal.DEMO_USER_WORKSPACE_PREFIX, id)
	newDemoUserUIStateId := fmt.Sprintf("%s_%s", internal.DEMO_USER_UISTATE_PREFIX, id)
	newDemoEnvId := fmt.Sprintf("%s_%s", internal.DEMO_USER_ENV_PREFIX, id)
	newDemoCollectionId := fmt.Sprintf("%s_%s", internal.DEMO_USER_COLLECTION_PREFIX, id)

	newDemoUserCtx := utils.ContextWithUserId(ctx, newDemoUserId)

	err := authSvc.storage.UserRepo.CreateDemoUser(newDemoUserCtx, newDemoUserId)

	if err != nil {
		return "", err
	}

	err = authSvc.storage.WorkspaceRepo.CreateWorkspace(newDemoUserCtx, internalModels.CreateWorkspaceDTO{
		Id:   newDemoUserWorkspaceId,
		Name: internal.DEMO_USER_WORKSPACE_PREFIX,
	})

	if err != nil {
		return "", err
	}

	err = authSvc.storage.UiStateRepo.InitializeUIStateForUser(newDemoUserCtx, newDemoUserUIStateId)

	if err != nil {
		return "", err
	}

	updateErr := authSvc.storage.UiStateRepo.UpdateUIStateForUser(newDemoUserCtx, internalModels.UpdateUIStateDTO{
		ActiveWorkspace: &newDemoUserWorkspaceId,
	})

	if updateErr != nil {
		return "", fmt.Errorf("failed to set demo workspace as active ui state")
	}

	err = authSvc.storage.EnvRepo.AddEnvironment(newDemoUserCtx, internalModels.AddEnvironmentDTO{
		Id:          newDemoEnvId,
		Name:        internal.DEMO_USER_ENV_PREFIX,
		WorkspaceId: newDemoUserWorkspaceId,
	})

	if err != nil {
		return "", err
	}

	err = authSvc.storage.CollectionRepo.AddCollection(newDemoUserCtx, internalModels.CreateCollectionDTO{
		Id:        newDemoCollectionId,
		Name:      internal.DEMO_USER_COLLECTION_PREFIX,
		Workspace: newDemoUserWorkspaceId,
	})

	if err != nil {
		return "", err
	}

	sessionTokenExpiry := time.Now().Add(internal.DEMO_USER_JWT_EXPIRY_MINS * time.Minute)

	sessionToken, err := authSvc.generateToken(newDemoUserId, sessionTokenExpiry)

	if err != nil {
		return "", err
	}

	return sessionToken, nil
}

func (authSvc *AuthService) ValidateMagicLink(ctx context.Context, magicToken string) (string, error) {

	claims, err := authSvc.ParseToken(magicToken)

	if err != nil {
		return "", err
	}

	existingUser, err := authSvc.storage.UserRepo.FindUserById(ctx, claims.UserId)

	if err != nil {
		return "", err
	}

	sessionTokenExpiry := time.Now().Add(internal.JWT_EXPIRY_HOURS * time.Hour)
	sessionToken, err := authSvc.generateToken(existingUser.Id, sessionTokenExpiry)

	if err != nil {
		return "", err
	}

	return sessionToken, nil
}

func (authSvc *AuthService) TryLogin(ctx context.Context, baseURL *url.URL, dto models.LoginRequestDTO) string {

	existingUser, err := authSvc.storage.UserRepo.FindUserByEmail(ctx, dto.Email)

	if err != nil {
		log.Printf("could not find user by email %s\n", dto.Email)
		return ""
	}

	maginLinkExpiry := time.Now().Add(internal.MAGIC_LINK_EXPIRY_MINS * time.Minute)
	magicLinkToken, err := authSvc.generateToken(existingUser.Id, maginLinkExpiry)

	if err != nil {
		log.Println("could not generate token for magic link")
		return ""
	}

	emailCallBackURL := baseURL.JoinPath("auth", "email.callback")
	q := emailCallBackURL.Query()

	q.Add("token", magicLinkToken)

	emailCallBackURL.RawQuery = q.Encode()
	magicLink := emailCallBackURL.String()

	log.Printf("magic link generated : %s", magicLink)

	if authSvc.mode == "prod" {
		go authSvc.mailer.SendMagicLink(existingUser.Email, magicLink)
	}

	return magicLink
}

func (authSvc *AuthService) TryRegisterAdmin(ctx context.Context, dto models.RegisterDTO) error {

	setup, err := authSvc.storage.AppSetupRepo.GetAppSetup(ctx)

	if setup.AdminUserConfigured {
		return ErrAlreadyConfigured
	}

	adminId, err := authSvc.storage.UserRepo.CreateAdminUser(ctx, internalModels.CreateUserDTO{
		Email: dto.Email,
	})

	if err != nil {
		return ErrAuthFailure
	}

	newUserCtx := utils.ContextWithUserId(ctx, adminId)

	newUiStateId := nanoid.Must()

	err = authSvc.storage.UiStateRepo.InitializeUIStateForUser(newUserCtx, newUiStateId)

	if err != nil {
		return ErrAuthFailure
	}

	err = authSvc.storage.AppSetupRepo.MarksetupDone(ctx)

	if err != nil {
		return ErrAuthFailure
	}

	return nil
}

func (authSvc *AuthService) GenerateSessionCookie(mode string, token string) http.Cookie {

	sameSiteMode := http.SameSiteLaxMode
	secure := false

	if mode == "local" {
		sameSiteMode = http.SameSiteLaxMode
		secure = false
	} else {
		sameSiteMode = http.SameSiteStrictMode
		secure = true
	}

	return http.Cookie{
		Name:     authSvc.sessionCookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSiteMode,
		MaxAge:   internal.JWT_EXPIRY_HOURS * 3600,
	}
}

func (authSvc *AuthService) ExtractSessionCookie(r *http.Request) (*http.Cookie, error) {
	return r.Cookie(authSvc.sessionCookieName)
}

func (authSvc *AuthService) ClearSessionCookie(mode string) http.Cookie {

	sameSiteMode := http.SameSiteLaxMode
	secure := false

	if mode == "local" {
		sameSiteMode = http.SameSiteLaxMode
		secure = false
	} else {
		sameSiteMode = http.SameSiteStrictMode
		secure = true
	}

	return http.Cookie{
		Name:     authSvc.sessionCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: sameSiteMode,
		MaxAge:   -1,
	}
}

func (authSvc *AuthService) GetUserInfo(ctx context.Context, claims *GurlJwtClaims) (models.UserInfo, error) {
	user, err := authSvc.storage.UserRepo.FindUserById(ctx, claims.UserId)

	if err != nil {
		return models.UserInfo{}, err
	}

	isDemoUser := strings.HasPrefix(user.Id, internal.DEMO_USER_ID_PREFIX)

	return models.UserInfo{
		Email:      user.Email,
		IsAdmin:    user.IsAdmin,
		IsDemoUser: isDemoUser,
		IssuedAt:   claims.IssuedAt.Time().UnixMilli(),
	}, nil
}

func (authSvc *AuthService) InviteUser(ctx context.Context, baseURL *url.URL, userEmail string) error {

	newUserId, err := authSvc.storage.UserRepo.CreateUser(ctx, internalModels.CreateUserDTO{
		Email: userEmail,
	})

	if err != nil {
		return err
	}

	newUserCtx := utils.ContextWithUserId(ctx, newUserId)

	newUiStateId := nanoid.Must()

	err = authSvc.storage.UiStateRepo.InitializeUIStateForUser(newUserCtx, newUiStateId)

	if err != nil {
		return ErrAuthFailure
	}

	maginLinkExpiry := time.Now().Add(internal.MAGIC_LINK_EXPIRY_MINS * time.Minute)
	magicLinkToken, err := authSvc.generateToken(newUserId, maginLinkExpiry)

	if err != nil {
		log.Println("could not generate token for magic link")
		return err
	}

	emailCallBackURL := baseURL.JoinPath("auth", "email.callback")
	q := emailCallBackURL.Query()

	q.Add("token", magicLinkToken)

	emailCallBackURL.RawQuery = q.Encode()
	magicLink := emailCallBackURL.String()

	log.Printf("magic link generated : %s", magicLink)

	go authSvc.mailer.SendInviteLink(userEmail, magicLink)

	return nil
}
