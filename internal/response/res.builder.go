package response

import (
	"fmt"
	"gurl/internal/db"
	"gurl/internal/models"
	"gurl/internal/utils"
	"net/http"
	"strings"
)

type GurlResponseBuilder struct {
	storage *db.Storage
}

func NewGurlResponseBuilder(storage *db.Storage) *GurlResponseBuilder {
	return &GurlResponseBuilder{
		storage: storage,
	}
}

func (rb *GurlResponseBuilder) BuildGurlRes(id string, res *http.Response, tempFilePath string, size int64, timeMs int64) *models.GurlRes {

	gres := &models.GurlRes{
		Id: id,
	}

	//status
	gres.StatusText = res.Status
	gres.StatusCode = res.StatusCode
	gres.Success = res.StatusCode >= 200 && res.StatusCode < 300

	//headers
	for k, v := range res.Header {
		gres.Headers = append(gres.Headers, models.GurlKeyValItem{
			Key:   k,
			Value: strings.Join(v, ""),
		})
	}

	//body
	responseContentType := res.Header.Get("content-type")
	normalizedCType := utils.NormalizeContentType(responseContentType)

	b := &models.GurlBody{
		Filepath:    tempFilePath,
		SuggestName: id,
		Extension:   ".bin",
		IsText:      utils.IsTextContent(normalizedCType),
	}

	mimeData, err := rb.storage.LookupMimeRecord(normalizedCType)

	if err != nil {
		fmt.Print("failed to fetch extensions from db")
	} else {

		exts := strings.Split(mimeData.Extensions, ",")

		if len(exts) > 0 && exts[0] != "" {
			fmt.Printf("\nfound file extension for normalized")
			b.Extension = fmt.Sprintf(".%s", exts[0])
		}
	}

	gres.Body = b

	//stats
	gres.SizeBytes = size
	gres.TimeMs = timeMs

	return gres
}
