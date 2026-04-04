package auth

import (
	"context"
	"fmt"
	"gurl/shared/db"
	internalModels "gurl/shared/models"
	"gurl/shared/nanoid"
	"gurl/shared/utils"
	"gurl/web/internal"
	"gurl/web/internal/emailx"
	"gurl/web/internal/models"
	"log"
	"net/http"
	"net/url"
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
	issuer            string
	audience          string
	sessionCookieName string
	userRepo          *db.UserRepository
	uiRepo            *db.UiStateRepository
	appSetupReo       *db.AppSetupRepo
	mailer            *emailx.Mailer
}

type GurlJwtClaims struct {
	jwt.Claims
	UserId string `json:"user_id"`
}

func NewAuthService(
	appName string,
	jwtSecret string,
	userRepo *db.UserRepository,
	uiRepo *db.UiStateRepository,
	appSetupRepo *db.AppSetupRepo,
	mailer *emailx.Mailer,
) *AuthService {
	return &AuthService{
		secret:            jwtSecret,
		issuer:            fmt.Sprintf("%s-jwt-issuer", appName),
		audience:          fmt.Sprintf("%s-%s", appName, "web-client"),
		sessionCookieName: "_gurl_session_",
		userRepo:          userRepo,
		uiRepo:            uiRepo,
		appSetupReo:       appSetupRepo,
		mailer:            mailer,
	}
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

func (authSvc *AuthService) ParseToken(token string) (string, error) {

	parsed, err := jwt.ParseSigned(token, []jose.SignatureAlgorithm{jose.HS256})

	if err != nil {
		return "", err
	}

	cl := GurlJwtClaims{}

	if err := parsed.Claims([]byte(authSvc.secret), &cl); err != nil {
		return "", err
	}

	if err := cl.Validate(jwt.Expected{
		Issuer: authSvc.issuer,
		Time:   time.Now(),
		AnyAudience: jwt.Audience{
			authSvc.audience,
		},
	}); err != nil {
		return "", err
	}

	if cl.UserId == "" {
		return "", fmt.Errorf("user_id is null in claims")
	}

	return cl.UserId, nil
}

func (authSvc *AuthService) ValidateMagicLink(ctx context.Context, magicToken string) (string, error) {

	userId, err := authSvc.ParseToken(magicToken)

	if err != nil {
		return "", err
	}

	existingUser, err := authSvc.userRepo.FindUserById(ctx, userId)

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

func (authSvc *AuthService) TryLogin(ctx context.Context, baseURL *url.URL, dto models.LoginRequestDTO) {

	existingUser, err := authSvc.userRepo.FindUserByEmail(ctx, dto.Email)

	if err != nil {
		log.Printf("could not find user by email %s\n", dto.Email)
		return
	}

	maginLinkExpiry := time.Now().Add(internal.MAGIC_LINK_EXPIRY_MINS * time.Minute)
	magicLinkToken, err := authSvc.generateToken(existingUser.Id, maginLinkExpiry)

	if err != nil {
		log.Println("could not generate token for magic link")
		return
	}

	emailCallBackURL := baseURL.JoinPath("auth", "email.callback")
	q := emailCallBackURL.Query()

	q.Add("token", magicLinkToken)

	emailCallBackURL.RawQuery = q.Encode()
	magicLink := emailCallBackURL.String()

	log.Printf("magic link generated : %s", magicLink)

	go authSvc.mailer.SendMagicLink(existingUser.Email, magicLink)
}

func (authSvc *AuthService) TryRegisterAdmin(ctx context.Context, dto models.RegisterDTO) error {

	setup, err := authSvc.appSetupReo.GetAppSetup(ctx)

	if setup.AdminUserConfigured {
		return ErrAlreadyConfigured
	}

	adminId, err := authSvc.userRepo.CreateAdminUser(ctx, internalModels.CreateUserDTO{
		Email: dto.Email,
	})

	if err != nil {
		return ErrAuthFailure
	}

	newUserCtx := utils.ContextWithUserId(ctx, adminId)

	newUiStateId := nanoid.Must()

	err = authSvc.uiRepo.InitializeUIStateForUser(newUserCtx, newUiStateId)

	if err != nil {
		return ErrAuthFailure
	}

	err = authSvc.appSetupReo.MarksetupDone(ctx)

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

func (authSvc *AuthService) GetUserInfo(ctx context.Context, userId string) (models.UserInfo, error) {
	user, err := authSvc.userRepo.FindUserById(ctx, userId)

	if err != nil {
		return models.UserInfo{}, err
	}

	return models.UserInfo{
		Email:   user.Email,
		IsAdmin: user.IsAdmin,
	}, nil
}

func (authSvc *AuthService) InviteUser(ctx context.Context, baseURL *url.URL, userEmail string) error {

	newUserId, err := authSvc.userRepo.CreateUser(ctx, internalModels.CreateUserDTO{
		Email: userEmail,
	})

	if err != nil {
		return err
	}

	newUserCtx := utils.ContextWithUserId(ctx, newUserId)

	newUiStateId := nanoid.Must()

	err = authSvc.uiRepo.InitializeUIStateForUser(newUserCtx, newUiStateId)

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
