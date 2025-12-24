package utils

import (
	"encoding/json"
	"gurl/internal/models"
	"strings"
)

func LoadMimeDb(r []byte) (map[string]models.MimeData, error) {

	mimeDB := make(map[string]models.MimeData)

	err := json.Unmarshal(r, &mimeDB)

	if err != nil {
		return nil, err
	}

	return mimeDB, nil
}

func NormalizeContentType(ctype string) string {

	if idx := strings.IndexByte(ctype, ';'); idx != -1 {
		return strings.TrimSpace(ctype[:idx])
	}

	return strings.TrimSpace(ctype)
}

func IsTextContent(cType string) bool {

	if cType == "" {
		return false
	}

	return strings.HasPrefix(cType, "text/") ||
		cType == "application/json" ||
		cType == "application/xml" ||
		cType == "application/javascript" ||
		cType == "application/x-www-form-urlencoded" ||
		cType == "image/svg+xml"
}
