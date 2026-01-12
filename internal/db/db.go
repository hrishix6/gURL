package db

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const (
	DB_NAME                 = "gurl.db"
	DEFAULT_COLLECTION_ID   = "gurl_default_collection"
	DEFAULT_COLLECTION_NAME = "Default"
)

func InitDb(dsn string) (*gorm.DB, error) {

	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})

	if err != nil {
		return nil, err
	}

	return db, nil
}
