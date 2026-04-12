package auth

import (
	"context"
	"gurl/shared/utils"
	"gurl/web/internal/config"
	"os"
	"testing"
	"time"
)

var authSvc *AuthService
var wantUserId = "user-123"

func TestMain(m *testing.M) {

	cfg := config.WebApplicationConfig{
		AppName: "gurl",
		Env:     "DEV",
		AuthConfig: &config.AuthConfig{
			JwtSecret: "j3zfJOXhLrVYpxNbtxwn/NTlbOrKp6csk63bkNZu8ik=",
		},
	}

	authSvc = NewAuthService(&cfg, nil, nil, nil)

	exitVal := m.Run()

	os.Exit(exitVal)
}

func TestGenerateToken(t *testing.T) {
	_, err := authSvc.generateToken(wantUserId, time.Now().Add(5*time.Minute))

	if err != nil {
		t.Errorf("expected token generation to succeed: %v", err)
	}
}

func TestParsingToken(t *testing.T) {

	token, err := authSvc.generateToken(wantUserId, time.Now().Add(5*time.Minute))

	if err != nil {
		t.Errorf("expected token generation to succeed: %v", err)
	}

	cl, err := authSvc.ParseToken(token)

	if err != nil {
		t.Errorf("expected token generation to succeed: %v", err)
	}

	if cl.UserId != wantUserId {
		t.Error("expected claims to have valid userid")
	}
}

func TestContextOverride(t *testing.T) {

	ctx := context.Background()

	u1 := "abc123"
	ctx1 := utils.ContextWithUserId(ctx, u1)

	u2 := "pqr123"
	ctx2 := utils.ContextWithUserId(ctx1, u2)

	got := utils.UserIdFromContext(ctx2)

	if got != u2 {
		t.Errorf("expected context to override userid and get %s but got %s", u2, got)
	}
}
