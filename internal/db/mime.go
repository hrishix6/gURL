package db

import (
	"gurl/internal/models"
	"strings"
)

type MimeRecord struct {
	BaseEntity
	Extensions string //comma separated list of extensions
}

func (mr *MimeRecord) FromJsonRecord(key string, record models.MimeData) MimeRecord {

	var extensions string

	if len(record.Extensions) > 0 {
		extensions = strings.Join(record.Extensions, ",")
	}

	m := MimeRecord{}

	m.Id = key
	m.Extensions = extensions

	return m
}
