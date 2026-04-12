package storage

import (
	"context"
	"errors"
	"fmt"
	"gurl/desktop/internal"
	dbPkg "gurl/shared/db"
	"gurl/shared/models"
	"gurl/shared/nanoid"
	"gurl/shared/utils"
	"io"
	"log"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gorm.io/gorm"
)

type DesktopStorage struct {
	db                *gorm.DB
	appCtx            context.Context
	tmpDir            string
	savedResponsesDir string
	envRepo           *dbPkg.EnvironmentRepository
	collectionRepo    *dbPkg.CollectionRepository
	reqRepo           *dbPkg.RequestRepository
	reqExampleRepo    *dbPkg.ReqExampleRepository
	uiStateRepo       *dbPkg.UiStateRepository
	workspaceRepo     *dbPkg.WorkspaceRepository
	userRepo          *dbPkg.UserRepository
}

func NewStorage(db *gorm.DB, tmpDir string, savedResponsesDir string) DesktopStorage {
	return DesktopStorage{
		db:                db,
		savedResponsesDir: savedResponsesDir,
		tmpDir:            tmpDir,
		envRepo:           dbPkg.NewEnvironmentRepository(db),
		collectionRepo:    dbPkg.NewCollectionRepository(db),
		reqRepo:           dbPkg.NewRequestRepository(db),
		reqExampleRepo:    dbPkg.NewReqExampleRepository(db),
		uiStateRepo:       dbPkg.NewUiStateRepository(db),
		workspaceRepo:     dbPkg.NewWorkspaceRepository(db),
		userRepo:          dbPkg.NewUserRepository(db),
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

func Startup(s *DesktopStorage, appCtx context.Context) (context.Context, error) {
	log.Println("[DesktopStorage] Initialization Started")

	//add default user if doesn't exist.
	existingUser, err := s.userRepo.FindUserByEmail(appCtx, internal.DEFAULT_USER_ID)

	userid := ""

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			newUserId, addErr := s.userRepo.CreateAdminUser(appCtx, models.CreateUserDTO{
				Email: internal.DEFAULT_USER_ID,
			})

			if addErr != nil {
				return nil, addErr
			}

			userid = newUserId

		} else {
			return nil, err
		}
	} else {
		userid = existingUser.Id
	}

	s.appCtx = utils.ContextWithUserId(appCtx, userid)

	log.Printf("userid in context is now: %s\n", utils.UserIdFromContext(s.appCtx))

	//add default UI state record if not exists
	_, err = s.uiStateRepo.GetUIStateForUser(s.appCtx)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {

			addErr := s.uiStateRepo.InitializeUIStateForUser(s.appCtx, nanoid.Must())

			if addErr != nil {
				return nil, fmt.Errorf("unable to add default UIState for default user")
			}

			log.Println("[DesktopStorage] Default UIState is created")
		} else {
			return nil, err
		}
	}

	log.Println("[DesktopStorage] Initialization Completed")
	return s.appCtx, nil
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

	srcPath := filepath.Join(s.tmpDir, dto.Name)

	srcF, err := os.Open(srcPath)

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
