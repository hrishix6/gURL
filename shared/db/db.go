package db

import (
	"net/url"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
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

func InitDesktopDb(dsn string) (*gorm.DB, error) {

	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})

	if err != nil {
		return nil, err
	}

	db.Exec("PRAGMA foreign_keys = ON;")
	return db, nil
}

func InitWebDb(dsn string) (*gorm.DB, error) {

	parsed, err := url.Parse(dsn)

	if err != nil {
		return nil, err
	}

	db, err := gorm.Open(postgres.Open(parsed.String()), &gorm.Config{})

	if err != nil {
		return nil, err
	}

	_lowDb, err := db.DB()

	if err != nil {
		return nil, err
	}

	_lowDb.SetMaxOpenConns(25)
	return db, nil
}
