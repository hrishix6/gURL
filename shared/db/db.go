package db

import (
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const (
	DB_NAME             = "gurl.db"
	DEFAULT_UI_STATE_ID = "gurl_ui_state"
)

type BaseEntity struct {
	Id        string `gorm:"primaryKey"`
	Created   int    `gorm:"autoCreateTime;column:created"`
	UpdatedAt int    `gorm:"autoUpdateTime;column:updated"`
}

func InitDb(dsn string) (*gorm.DB, error) {

	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})

	if err != nil {
		return nil, err
	}

	return db, nil
}
