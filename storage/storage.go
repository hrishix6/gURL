package storage

import (
	"context"
	"errors"
	"fmt"
	"gurl/internal/db"
	"gurl/internal/models"
	"io"
	"log"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Storage struct {
	db     *gorm.DB
	appCtx context.Context
}

func NewStorage(db *gorm.DB) *Storage {
	return &Storage{
		db: db,
	}
}

func NewTestStorage(db *gorm.DB, appCtx context.Context) *Storage {
	return &Storage{
		db:     db,
		appCtx: appCtx,
	}
}

func Startup(s *Storage, appCtx context.Context) error {
	log.Println("[Storage] Initialization Started")

	//store app context
	s.appCtx = appCtx

	//migrate
	err := s.db.AutoMigrate(
		&db.UIState{},
		&db.Collection{},
		&db.RequestDraft{},
		&db.Request{},
		&db.MimeRecord{},
	)

	if err != nil {
		return err
	}

	s.db.Exec("PRAGMA foreign_keys = ON;")
	log.Println("[Storage] Db Migrated")

	//add default collection if not exists
	_, err = s.getCollection(db.DEFAULT_COLLECTION_ID)

	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		addErr := s.insertCollection(&db.Collection{
			Id:   db.DEFAULT_COLLECTION_ID,
			Name: db.DEFAULT_COLLECTION_NAME,
		})

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

func (s *Storage) insertCollection(c *db.Collection) error {
	return gorm.G[db.Collection](s.db).Create(s.appCtx, c)
}

func (s *Storage) getCollection(id string) (db.Collection, error) {
	return gorm.G[db.Collection](s.db).Where("id = ?", id).First(s.appCtx)
}

func (s *Storage) addSavedReq(r *db.Request) error {
	return gorm.G[db.Request](s.db).Create(s.appCtx, r)
}

func (s *Storage) findSavedReq(id string) (db.Request, error) {
	return gorm.G[db.Request](s.db).Where("id = ?", id).First(s.appCtx)
}

func (s *Storage) DeleteSavedReq(id string) error {
	_, err := gorm.G[db.Request](s.db).Where("id = ?", id).Delete(s.appCtx)
	return err
}

func (s *Storage) findDraft(id string) (db.RequestDraft, error) {
	return gorm.G[db.RequestDraft](s.db).Where("id = ?", id).First(s.appCtx)
}

func (s *Storage) initializeUIState() error {
	return gorm.G[db.UIState](s.db).Create(s.appCtx, &db.UIState{
		Id: db.DEFAULT_UI_STATE_ID,
	})
}

func (s *Storage) RemoveDraft(id string) error {
	_, err := gorm.G[db.RequestDraft](s.db).Where("id = ?", id).Delete(s.appCtx)

	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) GetSavedRequests() ([]models.RequestDTO, error) {

	records, err := gorm.G[db.Request](s.db).Find(s.appCtx)

	if err != nil {
		return []models.RequestDTO{}, err
	}

	var results []models.RequestDTO

	for _, record := range records {

		results = append(results, *record.ToRequestDTO())
	}

	return results, nil
}

func (s *Storage) FindDraftById(id string) (*models.RequestDraftDTO, error) {
	found, err := gorm.G[db.RequestDraft](s.db).Where("id = ?", id).First(s.appCtx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return found.ToRequestDraftDTO(), nil
}

func (s *Storage) FindDraftIdsByCollection(collectionId string) ([]string, error) {
	drafts, err := gorm.G[db.RequestDraft](s.db).Where("parentCollectionId = ?", collectionId).Find(s.appCtx)

	if err != nil {
		return []string{}, err
	}

	var results []string

	for _, draft := range drafts {
		results = append(results, draft.Id)
	}

	return results, nil
}

func (s *Storage) AddFreshDraft(dto models.AddFreshDraftDTO) error {
	return gorm.G[db.RequestDraft](s.db).Create(s.appCtx, &db.RequestDraft{
		Id: dto.Id,
	})
}

func (s *Storage) AddDraft(dto models.RequestDraftDTO) error {
	var dr db.RequestDraft
	dr.FromRequestDraftDTO(&dto)
	return gorm.G[db.RequestDraft](s.db).Create(s.appCtx, &dr)
}

func (s *Storage) UpdateDraftUrl(dto models.UpdateDraftUrlDTO) error {

	_, err := gorm.G[db.RequestDraft](s.db).Where("id = ?", dto.RequestId).Update(s.appCtx, "url", dto.Url)

	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) UpdateDraftQuery(dto models.UpdateDraftQueryDTO) error {
	_, err := gorm.G[db.RequestDraft](s.db).Where("id = ?", dto.RequestId).Update(s.appCtx, "query",
		datatypes.JSON([]byte(dto.QueryJSON)),
	)

	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) UpdateDraftHeaders(dto models.UpdateDraftHeadersDTO) error {

	_, err := gorm.G[db.RequestDraft](s.db).Where("id = ?", dto.RequestId).Update(s.appCtx, "headers",
		datatypes.JSON([]byte(dto.HeadersJSON)),
	)

	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) UpdateDraftCookies(dto models.UpdateDraftCookiesDTO) error {

	_, err := gorm.G[db.RequestDraft](s.db).Where("id = ?", dto.RequestId).Update(s.appCtx, "cookies",
		datatypes.JSON([]byte(dto.CookiesJSON)),
	)

	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) UpdateDraftMultipartForm(dto models.UpdateDraftMultipartFormDTO) error {
	_, err := gorm.G[db.RequestDraft](s.db).Where("id = ?", dto.RequestId).Update(s.appCtx, "multipart",
		datatypes.JSON([]byte(dto.MultipartJSON)),
	)

	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) UpdateDraftUrlEncodedForm(dto models.UpdateDraftUrlEncodedFormDTO) error {
	_, err := gorm.G[db.RequestDraft](s.db).Where("id = ?", dto.RequestId).Update(s.appCtx, "urlencoded",
		datatypes.JSON([]byte(dto.UrlEncodedFormJSON)),
	)

	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) UpdateDraftTextBody(dto models.UpdateDraftTextBodyDTO) error {
	_, err := gorm.G[db.RequestDraft](s.db).Where("id = ?", dto.RequestId).Update(s.appCtx, "textbody", dto.TextBody)

	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) UpdateDraftBinaryBody(dto models.UpdateDraftBinaryBodyDTO) error {
	_, err := gorm.G[db.RequestDraft](s.db).Where("id = ?", dto.RequestId).Update(s.appCtx, "binarybody", datatypes.JSON([]byte(dto.BinaryBodyJSON)))

	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) UpdateDraftMethod(dto models.UpdateDraftMethodDTO) error {
	_, err := gorm.G[db.RequestDraft](s.db).Where("id = ?", dto.RequestId).Update(s.appCtx, "method", dto.Method)

	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) UpdateDraftBodyType(dto models.UpdateDraftBodyTypeDTO) error {
	_, err := gorm.G[db.RequestDraft](s.db).Where("id = ?", dto.RequestId).Update(s.appCtx, "bodyType", dto.BodyType)

	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) updateDraftParents(id string, delta map[string]interface{}) error {
	tx := s.db.Model(&db.RequestDraft{}).Where("id = ?", id).Updates(delta)

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (s *Storage) AddCollection(dto models.AddCollectionDTO) error {
	return s.insertCollection(&db.Collection{
		Id:   dto.Id,
		Name: dto.Name,
	})
}

func (s *Storage) GetAllCollections() ([]models.CollectionDTO, error) {
	records, err := gorm.G[db.Collection](s.db).Find(s.appCtx)

	if err != nil {
		return []models.CollectionDTO{}, err
	}

	var results []models.CollectionDTO

	for _, record := range records {
		results = append(results, *record.ToCollectionDTO())
	}

	return results, nil
}

func (s *Storage) RenameCollection(id, name string) error {
	_, err := gorm.G[db.Collection](s.db).Where("id = ?", id).Update(s.appCtx, "name", name)
	return err
}

func (s *Storage) DeleteCollection(id string) error {
	_, err := gorm.G[db.Collection](s.db).Where("id = ?", id).Delete(s.appCtx)

	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) ClearCollection(id string) error {
	r, err := gorm.G[db.Request](s.db).Where("collection_id = ?", id).Delete(s.appCtx)

	log.Printf("deleted %d requsts under collection\n", r)

	return err
}

func (s *Storage) DeleteDraftsUnderCollection(collectionId string) error {
	tx := s.db.Model(&db.RequestDraft{}).Where("parentCollectionId = ?", collectionId).Updates(map[string]any{
		"parentRequestId":    "",
		"parentRequestName":  "",
		"parentCollectionId": "",
	})

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (s *Storage) DeleteRequestDrafts(requestId string) error {
	tx := s.db.Model(&db.RequestDraft{}).Where("parentRequestId = ?", requestId).Updates(map[string]any{
		"parentRequestId":    "",
		"parentRequestName":  "",
		"parentCollectionId": "",
	})

	if tx.Error != nil {
		return tx.Error
	}

	return nil
}

func (s *Storage) UpdateOpenTabs(dto models.UpdateOpenTabsDTO) error {
	_, err := gorm.G[db.UIState](s.db).Where("id = ?", db.DEFAULT_UI_STATE_ID).Update(s.appCtx, "openTabs", datatypes.JSON([]byte(dto.OpenTabsJSON)))

	return err
}

func (s *Storage) UpdateLayoutPreference(layout string) error {
	_, err := gorm.G[db.UIState](s.db).Where("id = ?", db.DEFAULT_UI_STATE_ID).Update(s.appCtx, "layout", layout)

	return err
}

func (s *Storage) UpdateSideBarPreference(isOpen bool) error {
	_, err := gorm.G[db.UIState](s.db).Where("id = ?", db.DEFAULT_UI_STATE_ID).Update(s.appCtx, "sidebarOpen", isOpen)

	return err
}

func (s *Storage) GetUIState() (*models.UIStateDTO, error) {
	r, err := gorm.G[db.UIState](s.db).Where("id = ?", db.DEFAULT_UI_STATE_ID).First(s.appCtx)

	if err != nil {
		return nil, err
	}

	return &models.UIStateDTO{
		OpenTabs:      string(r.OpenTabs),
		Layout:        r.Layout,
		ActiveTab:     r.ActiveTab,
		IsSidebarOpen: r.IsSidebarOpen,
	}, nil
}

func (s *Storage) UpdateActiveTab(tabId string) error {
	_, err := gorm.G[db.UIState](s.db).Where("id = ?", db.DEFAULT_UI_STATE_ID).Update(s.appCtx, "activeTab", tabId)
	return err
}

func (s *Storage) SaveDraftAsRequest(dto models.SaveDraftAsReqDTO) error {

	draft, err := s.findDraft(dto.DraftId)

	if err != nil {
		return err
	}

	//update draft
	err = s.updateDraftParents(dto.DraftId, map[string]any{
		"parentRequestId":    dto.RequestId,
		"parentRequestName":  dto.Name,
		"parentCollectionId": dto.CollectionId,
	})

	if err != nil {
		return err
	}

	existing, err := s.findSavedReq(dto.RequestId)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			req := &db.Request{}
			req.FromRequestDraft(&dto, &draft)

			createErr := s.addSavedReq(req)

			if createErr != nil {
				return createErr
			}

			return nil
		} else {
			return err
		}
	}

	//delete existing req and instead create new record.
	err = s.DeleteSavedReq(existing.Id)

	if err != nil {
		return err
	}

	//create new saved request with same id and new data
	req := &db.Request{}

	req.FromRequestDraft(&dto, &draft)

	createErr := s.addSavedReq(req)

	if createErr != nil {
		return createErr
	}

	return nil
}

func (s *Storage) SaveRequestCopy(dto models.SaveRequestCopyDTO) error {

	existing, err := s.findSavedReq(dto.SourceId)

	if err != nil {
		return err
	}

	existing.Id = dto.Id
	existing.Name = dto.Name

	createErr := s.addSavedReq(&existing)

	if createErr != nil {
		return createErr
	}

	return nil
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

	info, err := os.Stat(file)

	if err != nil {
		return nil, err
	}

	if info.IsDir() {
		return nil, fmt.Errorf("chosen item is not a file")
	}

	return &models.FileStats{
		Name: info.Name(),
		Size: info.Size(),
		Path: file,
	}, nil
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

	dstF, err := os.Create(dst)

	if err != nil {
		return err
	}

	_, err = io.Copy(dstF, srcF)

	if err != nil {
		return err
	}

	return nil
}
