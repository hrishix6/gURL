package auth

import (
	"context"
	"gurl/shared/utils"
	"os"
	"testing"
	"time"
)

var authSvc *AuthService
var wantUserId = "user-123"

func TestMain(m *testing.M) {

	authSvc = NewAuthService("gurl", "j3zfJOXhLrVYpxNbtxwn/NTlbOrKp6csk63bkNZu8ik=", nil, nil, nil, nil)

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

	userId, err := authSvc.ParseToken(token)

	if err != nil {
		t.Errorf("expected token generation to succeed: %v", err)
	}

	if userId != wantUserId {
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
