package storage

import (
	"context"
	"errors"
	"fmt"
	"gurl/internal/db"
	"gurl/internal/models"
	"gurl/internal/utils"
	"io"
	"log"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gorm.io/gorm"
)

type Storage struct {
	db                *gorm.DB
	appCtx            context.Context
	savedResponsesDir string
}

func NewStorage(db *gorm.DB, savedResponsesDir string) Storage {
	return Storage{
		db:                db,
		savedResponsesDir: savedResponsesDir,
	}
}

func NewTestStorage(db *gorm.DB, appCtx context.Context) Storage {
	return Storage{
		db:     db,
		appCtx: appCtx,
	}
}

func Startup(s *Storage, appCtx context.Context) error {
	log.Println("[Storage] Initialization Started")

	s.appCtx = appCtx

	s.db.Exec("PRAGMA foreign_keys = ON;")
	log.Println("[Storage] Db Migrated")

	err := s.db.AutoMigrate(
		&db.UIState{},
		&db.Collection{},
		&db.RequestDraft{},
		&db.RequestExample{},
		&db.Request{},
		&db.MimeRecord{},
		&db.EnvironmentDraft{},
		&db.Environment{},
	)

	if err != nil {
		return err
	}

	//add default collection if not exists
	_, err = gorm.G[db.Collection](s.db).Where("id = ?", db.DEFAULT_COLLECTION_ID).First(s.appCtx)

	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		addErr := s.AddCollection(db.DEFAULT_COLLECTION_ID, db.DEFAULT_COLLECTION_NAME)

		if addErr != nil {
			return fmt.Errorf("unable to add default collection")
		}

		log.Println("[Storage] Default Collection is created")
	}

	//add default UI state record if not exists
	_, err = s.GetUIState()

	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {

		addErr := s.initializeUIState()

		if addErr != nil {
			return fmt.Errorf("unable to add default UIState")
		}

		log.Println("[Storage] Default UIState is created")
	}

	log.Println("[Storage] Initialization Completed")

	return nil
}

func Shutdown(s *Storage) {
	log.Println("[Storage] Shutdown Started")

	rawDb, _ := s.db.DB()
	rawDb.Close()

	log.Println("[Storage] Closed Db connection")

	log.Println("[Storage] Shutdown Completed")
}

// file IO
func (s *Storage) ChooseFile() (*models.FileStats, error) {

	dialogueOptions := runtime.OpenDialogOptions{
		Title:           "Choose File to Upload",
		ShowHiddenFiles: true,
	}

	if dir, err := os.UserHomeDir(); err == nil {
		dialogueOptions.DefaultDirectory = dir
	}

	file, err := runtime.OpenFileDialog(s.appCtx, dialogueOptions)

	if err != nil {
		return nil, err
	}

	return utils.GetFileStats(file)
}

func (s *Storage) SaveFile(srcFilePath string) error {

	dialogueOptions := runtime.SaveDialogOptions{
		Title:           "Choose location to store response",
		DefaultFilename: filepath.Base(srcFilePath),
	}

	if dir, err := os.UserHomeDir(); err == nil {
		dialogueOptions.DefaultDirectory = dir
	}

	dst, err := runtime.SaveFileDialog(s.appCtx, dialogueOptions)

	if err != nil {
		return err
	}

	srcF, err := os.Open(srcFilePath)

	if err != nil {
		return err
	}
	defer srcF.Close()

	dstF, err := os.Create(dst)

	if err != nil {
		return err
	}
	defer dstF.Close()

	_, err = io.Copy(dstF, srcF)

	if err != nil {
		return err
	}

	return nil
}
