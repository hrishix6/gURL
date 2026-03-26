package assets

import "embed"

//go:embed all:static/browser
var Assets embed.FS

//go:embed all:static/browser/mime.db.json
var MimedbJson []byte
