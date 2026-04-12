package db

import (
	"fmt"
	"net/url"

	"github.com/glebarez/sqlite"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	//"gorm.io/plugin/soft_delete"
)

type BaseEntity struct {
	Id        string `gorm:"primaryKey"`
	Created   int64  `gorm:"autoCreateTime;column:created"`
	UpdatedAt int64  `gorm:"autoUpdateTime;column:updated"`
	// Deleted   soft_delete.DeletedAt `gorm:"column:is_deleted;softDelete:flag"`
}

func InitDesktopDb(dsn string) (*gorm.DB, error) {

	db, err := gorm.Open(sqlite.Open(fmt.Sprintf("%s?_pragma=foreign_keys(1)", dsn)), &gorm.Config{})

	if err != nil {
		return nil, err
	}

	err = db.AutoMigrate(
		&User{},
		&MimeRecord{},
		&UIState{},
		&Workspace{},
		&Collection{},
		&Request{},
		&RequestDraft{},
		&RequestExample{},
		&Environment{},
		&EnvironmentDraft{},
	)

	if err != nil {
		return nil, err
	}
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

	err = db.AutoMigrate(
		&AppSetup{},
		&User{},
		&MimeRecord{},
		&UIState{},
		&Workspace{},
		&Collection{},
		&Request{},
		&RequestDraft{},
		&RequestExample{},
		&Environment{},
		&EnvironmentDraft{},
	)

	if err != nil {
		return nil, err
	}

	return db, nil
}
