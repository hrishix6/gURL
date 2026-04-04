package emailx

import (
	"fmt"
	"net/url"
	"testing"
)

func TestSendMagicLink(t *testing.T) {

	baseURL := "http://localhost:8080/"

	loginURL, _ := url.Parse(baseURL)

	l2 := loginURL.JoinPath("auth", "email.callback")

	l2.Query().Add("token", "magic-token")

	v := l2.String()

	fmt.Println(v)
}
