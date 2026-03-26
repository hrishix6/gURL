package storage

import (
	"context"
	"errors"
	"fmt"
	dbPkg "gurl/internal/db"
	"gurl/internal/models"
	"gurl/internal/utils"
	"io"
	"log"
	"os"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gorm.io/gorm"
)

type DesktopStorage struct {
	db                *gorm.DB
	appCtx            context.Context
	savedResponsesDir string
	envRepo           *dbPkg.EnvironmentRepository
	collectionRepo    *dbPkg.CollectionRepository
	reqRepo           *dbPkg.RequestRepository
	reqExampleRepo    *dbPkg.ReqExampleRepository
	uiStateRepo       *dbPkg.UiStateRepository
	workspaceRepo     *dbPkg.WorkspaceRepository
}

func NewStorage(db *gorm.DB, savedResponsesDir string) DesktopStorage {
	return DesktopStorage{
		db:                db,
		savedResponsesDir: savedResponsesDir,
		envRepo:           dbPkg.NewEnvironmentRepository(db),
		collectionRepo:    dbPkg.NewCollectionRepository(db),
		reqRepo:           dbPkg.NewRequestRepository(db),
		reqExampleRepo:    dbPkg.NewReqExampleRepository(db),
		uiStateRepo:       dbPkg.NewUiStateRepository(db),
		workspaceRepo:     dbPkg.NewWorkspaceRepository(db),
	}
}

func NewTestStorage(db *gorm.DB, appCtx context.Context) DesktopStorage {
	return DesktopStorage{
		db:             db,
		appCtx:         appCtx,
		envRepo:        dbPkg.NewEnvironmentRepository(db),
		collectionRepo: dbPkg.NewCollectionRepository(db),
		reqRepo:        dbPkg.NewRequestRepository(db),
		reqExampleRepo: dbPkg.NewReqExampleRepository(db),
		uiStateRepo:    dbPkg.NewUiStateRepository(db),
		workspaceRepo:  dbPkg.NewWorkspaceRepository(db),
	}
}

func Startup(s *DesktopStorage, appCtx context.Context) error {
	log.Println("[DesktopStorage] Initialization Started")

	s.appCtx = appCtx

	s.db.Exec("PRAGMA foreign_keys = ON;")

	err := s.db.AutoMigrate(
		&dbPkg.MimeRecord{},
		&dbPkg.UIState{},
		&dbPkg.Workspace{},
		&dbPkg.Collection{},
		&dbPkg.Request{},
		&dbPkg.RequestDraft{},
		&dbPkg.RequestExample{},
		&dbPkg.Environment{},
		&dbPkg.EnvironmentDraft{},
	)

	if err != nil {
		return err
	}

	log.Println("[DesktopStorage] Db Migrated")

	//add default UI state record if not exists
	_, err = s.GetUIState()

	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {

		addErr := s.initializeUIState()

		if addErr != nil {
			return fmt.Errorf("unable to add default UIState")
		}

		log.Println("[DesktopStorage] Default UIState is created")
	}

	log.Println("[DesktopStorage] Initialization Completed")

	return nil
}

func Shutdown(s *DesktopStorage) {
	log.Println("[DesktopStorage] Shutdown Started")

	rawDb, _ := s.db.DB()
	rawDb.Close()

	log.Println("[DesktopStorage] Closed Db connection")

	log.Println("[DesktopStorage] Shutdown Completed")
}

// file IO
func (s *DesktopStorage) ChooseFile() (*models.FileStats, error) {

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

func (s *DesktopStorage) SaveFile(dto models.DownloadTmpFileDTO) error {

	dialogueOptions := runtime.SaveDialogOptions{
		Title:           "Choose location to store response",
		DefaultFilename: dto.Name,
	}

	if dir, err := os.UserHomeDir(); err == nil {
		dialogueOptions.DefaultDirectory = dir
	}

	dst, err := runtime.SaveFileDialog(s.appCtx, dialogueOptions)

	if err != nil {
		return err
	}

	srcF, err := os.Open(dto.Path)

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
