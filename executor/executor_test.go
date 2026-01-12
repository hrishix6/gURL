package executor

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

var testSrv *httptest.Server

func TestMain(m *testing.M) {

	testSrv = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Hello, client")
	}))

}
