package internal

const (
	SCHEMA_VERSION = "1.0"
	APP_SETUP_ID   = "gurl_app_setup"
)

var SKIP_MOCK_HEADERS = map[string]struct{}{
	"content-length":    {},
	"transfer-encoding": {},
	"content-encoding":  {},
	"trailer":           {},
	"date":              {},
	"connection":        {},
	"keep-alive":        {},
	"upgrade":           {},
}
