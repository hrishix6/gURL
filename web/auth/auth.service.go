package auth

import (
	"context"
	"errors"
	"fmt"
	"gurl/shared/db"
	internalModels "gurl/shared/models"
	"gurl/shared/nanoid"
	"gurl/shared/utils"
	"gurl/web/internal"
	"gurl/web/internal/models"
	"net/http"
	"time"

	"github.com/go-jose/go-jose/v4"
	"github.com/go-jose/go-jose/v4/jwt"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var (
	ErrAuthInvalidCredentials = fmt.Errorf("invalid credentials")
	ErrAuthTokenGenFailed     = fmt.Errorf("failed to generate token")
	ErrAuthFailure            = fmt.Errorf("auth system failed")
)

type AuthService struct {
	secret            string
	issuer            string
	audience          string
	sessionCookieName string
	userRepo          *db.UserRepository
	uiRepo            *db.UiStateRepository
}

type GurlJwtClaims struct {
	jwt.Claims
	UserId string `json:"user_id"`
}

func NewAuthService(appName string, jwtSecret string, userRepo *db.UserRepository, uiRepo *db.UiStateRepository) *AuthService {
	return &AuthService{
		secret:            jwtSecret,
		issuer:            fmt.Sprintf("%s-jwt-issuer", appName),
		audience:          fmt.Sprintf("%s-%s", appName, "web-client"),
		sessionCookieName: "_gurl_session_",
		userRepo:          userRepo,
		uiRepo:            uiRepo,
	}
}

func (authSvc *AuthService) generateToken(userId string) (string, error) {

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
			Expiry:   jwt.NewNumericDate(time.Now().Add(internal.JWT_EXPIRY_HOURS * time.Hour)),
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

func (authSvc *AuthService) hashPassword(password string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	if err != nil {
		return "", err
	}

	return string(hashed), nil
}

func (authSvc *AuthService) comparePassword(pw string, pwHash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(pwHash), []byte(pw))
	return err == nil
}

func (authSvc *AuthService) TryLogin(ctx context.Context, dto models.LoginRequestDTO) (string, error) {

	existingUser, err := authSvc.userRepo.FindUserByUsername(ctx, dto.Username)

	if err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", ErrAuthInvalidCredentials
		}

		return "", ErrAuthFailure
	}

	isMatch := authSvc.comparePassword(dto.Password, existingUser.PasswordHash)

	if !isMatch {
		return "", ErrAuthInvalidCredentials
	}

	token, err := authSvc.generateToken(existingUser.Id)

	if err != nil {
		return "", ErrAuthTokenGenFailed
	}

	return token, nil
}

func (authSvc *AuthService) TryRegister(ctx context.Context, dto models.RegisterDTO) error {

	pwHash, err := authSvc.hashPassword(dto.Password)

	if err != nil {
		return ErrAuthFailure
	}

	newUserId, err := authSvc.userRepo.CreateUser(ctx, internalModels.CreateUserDTO{
		Username:     dto.Username,
		Email:        dto.Email,
		PasswordHash: pwHash,
	})

	if err != nil {
		return ErrAuthFailure
	}

	newUserCtx := utils.ContextWithUserId(ctx, newUserId)

	newUiStateId := nanoid.Must()

	err = authSvc.uiRepo.InitializeUIStateForUser(newUserCtx, newUiStateId)

	if err != nil {
		return ErrAuthFailure
	}

	return nil
}

func (authSvc *AuthService) GenerateSessionCookie(token string, secure bool) http.Cookie {
	return http.Cookie{
		Name:     authSvc.sessionCookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   internal.JWT_EXPIRY_HOURS * 3600,
	}
}

func (authSvc *AuthService) ExtractSessionCookie(r *http.Request) (*http.Cookie, error) {
	return r.Cookie(authSvc.sessionCookieName)
}

func (authSvc *AuthService) ClearSessionCookie(secure bool) http.Cookie {
	return http.Cookie{
		Name:     authSvc.sessionCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   secure,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	}
}
