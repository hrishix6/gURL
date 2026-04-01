package auth

import (
	"os"
	"testing"
)

var authSvc *AuthService
var wantUserId = "user-123"

func TestMain(m *testing.M) {

	authSvc = NewAuthService("gurl", "j3zfJOXhLrVYpxNbtxwn/NTlbOrKp6csk63bkNZu8ik=", nil, nil)

	exitVal := m.Run()

	os.Exit(exitVal)
}

func TestGenerateToken(t *testing.T) {
	_, err := authSvc.generateToken(wantUserId)

	if err != nil {
		t.Errorf("expected token generation to succeed: %v", err)
	}
}

func TestParsingToken(t *testing.T) {

	token, err := authSvc.generateToken(wantUserId)

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
