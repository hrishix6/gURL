package storage

import (
	"context"
	"errors"
	"fmt"
	dbPkg "gurl/shared/db"
	"log"

	"gorm.io/gorm"
)

type WebStorage struct {
	db                *gorm.DB
	SavedResponsesDir string
	EnvRepo           *dbPkg.EnvironmentRepository
	CollectionRepo    *dbPkg.CollectionRepository
	ReqRepo           *dbPkg.RequestRepository
	ReqExampleRepo    *dbPkg.ReqExampleRepository
	UiStateRepo       *dbPkg.UiStateRepository
	WorkspaceRepo     *dbPkg.WorkspaceRepository
	UserRepo          *dbPkg.UserRepository
	AppSetupRepo      *dbPkg.AppSetupRepo
	MimeRepo          *dbPkg.MimeRepository
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
		UserRepo:          dbPkg.NewUserRepository(db),
		AppSetupRepo:      dbPkg.NewAppSetupRepo(db),
		MimeRepo:          dbPkg.NewMimeRepository(db),
	}
}

func (ws *WebStorage) Startup(ctx context.Context) error {
	log.Println("[WebStorage] Initialization Started")

	_, err := ws.AppSetupRepo.GetAppSetup(ctx)

	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {

		addErr := ws.AppSetupRepo.InitAppSetup(ctx)

		if addErr != nil {
			return fmt.Errorf("unable to add default app setup entry")
		}

		log.Println("[WebStorage] App initial setup entry created")
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
