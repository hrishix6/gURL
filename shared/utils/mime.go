package utils

import (
	"encoding/json"
	"gurl/shared/models"
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
