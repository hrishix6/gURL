package storage

import (
	"context"
	"errors"
	"fmt"
	dbPkg "gurl/internal/db"
	"log"

	"gorm.io/gorm"
)

type WebStorage struct {
	db                *gorm.DB
	appCtx            context.Context
	SavedResponsesDir string
	EnvRepo           *dbPkg.EnvironmentRepository
	CollectionRepo    *dbPkg.CollectionRepository
	ReqRepo           *dbPkg.RequestRepository
	ReqExampleRepo    *dbPkg.ReqExampleRepository
	UiStateRepo       *dbPkg.UiStateRepository
	WorkspaceRepo     *dbPkg.WorkspaceRepository
}

func NewWebStorage(db *gorm.DB, savedResponsesDir string) *WebStorage {
	return &WebStorage{
		db:                db,
		SavedResponsesDir: savedResponsesDir,
		EnvRepo:           dbPkg.NewEnvironmentRepository(db),
		CollectionRepo:    dbPkg.NewCollectionRepository(db),
		ReqRepo:           dbPkg.NewRequestRepository(db),
		ReqExampleRepo:    dbPkg.NewReqExampleRepository(db),
		UiStateRepo:       dbPkg.NewUiStateRepository(db),
		WorkspaceRepo:     dbPkg.NewWorkspaceRepository(db),
	}
}

func (ws *WebStorage) Startup(ctx context.Context) error {
	log.Println("[WebStorage] Initialization Started")

	ws.db.Exec("PRAGMA foreign_keys = ON;")

	err := ws.db.AutoMigrate(
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

	log.Println("[WebStorage] Db Migrated")

	//add default UI state record if not exists
	_, err = ws.UiStateRepo.GetUIState(ctx)

	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {

		addErr := ws.UiStateRepo.InitializeUIState(ctx)

		if addErr != nil {
			return fmt.Errorf("unable to add default UIState")
		}

		log.Println("[WebStorage] Default UIState is created")
	}

	log.Println("[WebStorage] Initialization Completed")

	return nil
}

func (ws *WebStorage) Shutdown() {
	log.Println("[WebStorage] Shutdown Started")

	rawDb, _ := ws.db.DB()

	rawDb.Close()

	log.Println("[WebStorage] Closed Db connection")

	log.Println("[WebStorage] Shutdown Completed")
}
