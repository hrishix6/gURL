package db

import (
	"context"
	"gurl/shared/models"
	"strings"

	"gorm.io/gorm"
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

type MimeRepository struct {
	db *gorm.DB
}

func NewMimeRepository(db *gorm.DB) *MimeRepository {
	return &MimeRepository{
		db: db,
	}
}

func (mr *MimeRepository) BulkAddMimeRecords(ctx context.Context, m map[string]models.MimeData, batch int) error {

	records := []MimeRecord{}

	record := &MimeRecord{}

	for k, v := range m {
		records = append(records, record.FromJsonRecord(k, v))
	}

	if batch == 0 {
		batch = 20
	}

	return gorm.G[MimeRecord](mr.db).CreateInBatches(ctx, &records, batch)
}

func (mr *MimeRepository) FindMimeRecord(ctx context.Context, mimeType string) (MimeRecord, error) {
	return gorm.G[MimeRecord](mr.db).Where("id = ?", mimeType).First(ctx)
}

func (mr *MimeRepository) GetRecordCount(ctx context.Context) (int64, error) {
	return gorm.G[MimeRecord](mr.db).Count(ctx, "id")
}
