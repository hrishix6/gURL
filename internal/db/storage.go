package db

import (
	"context"
	"errors"
	"fmt"
	"gurl/internal/models"
	"gurl/internal/utils"

	"gorm.io/datatypes"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

const (
	DB_NAME = "gurl.db"
)

func InitDb(dsn string) (*gorm.DB, error) {

	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})

	if err != nil {
		return nil, err
	}

	return db, nil
}

type Storage struct {
	db  *gorm.DB
	ctx context.Context
}

func NewStorage(db *gorm.DB) *Storage {
	return &Storage{
		db: db,
	}
}

func NewTestStorage(db *gorm.DB, ctx context.Context) *Storage {
	return &Storage{
		db:  db,
		ctx: ctx,
	}
}

func (s *Storage) Init(ctx context.Context, mimeDbJson []byte) {
	s.ctx = ctx

	//migrate
	s.db.AutoMigrate(
		&models.UIState{},
		&models.Collection{},
		&models.RequestDraft{},
		&models.Request{},
		&models.MimeRecord{},
	)

	//check if mime db needs to be populated

	count, err := gorm.G[models.MimeRecord](s.db).Count(s.ctx, "id")

	if err != nil {
		panic(err)
	}

	if count == 0 {
		fmt.Println("no mime records found in the db, populating...")
		m, err := utils.LoadMimeDb(mimeDbJson)

		if err != nil {
			panic(err)
		}

		err = s.BulkAddMimeRecords(m, 500)

		if err != nil {
			panic(err)
		}
	}

	//add default models.Collection if not exist
	_, err = s.GetCollection(models.DEFAULT_COLLECTION)

	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {
		addErr := s.AddCollection(&models.Collection{
			Id:   models.DEFAULT_COLLECTION,
			Name: "Default",
		})

		if addErr != nil {
			panic(err)
		}

		fmt.Println("default models.Collection is created")
	}

	_, err = s.GetUIState()

	if err != nil && errors.Is(err, gorm.ErrRecordNotFound) {

		addErr := s.InitializeUIState()

		if addErr != nil {
			panic(err)
		}

		fmt.Println("default models.UIState is created")
	}

}

func (s *Storage) BulkAddMimeRecords(m map[string]models.MimeData, batch int) error {

	records := []models.MimeRecord{}

	record := &models.MimeRecord{}

	for k, v := range m {
		records = append(records, record.FromJsonRecord(k, v))
	}

	if batch == 0 {
		batch = 20
	}

	return gorm.G[models.MimeRecord](s.db).CreateInBatches(s.ctx, &records, batch)
}

func (s *Storage) LookupMimeRecord(id string) (models.MimeRecord, error) {
	return gorm.G[models.MimeRecord](s.db).Where("id = ?", id).First(s.ctx)
}

func (s *Storage) AddCollection(c *models.Collection) error {
	return gorm.G[models.Collection](s.db).Create(s.ctx, c)
}

func (s *Storage) GetAllCollections() ([]models.Collection, error) {
	return gorm.G[models.Collection](s.db).Find(s.ctx)
}

func (s *Storage) GetCollection(id string) (models.Collection, error) {
	return gorm.G[models.Collection](s.db).Where("id = ?", id).First(s.ctx)
}

func (s *Storage) AddSavedReq(r *models.Request) error {
	return gorm.G[models.Request](s.db).Create(s.ctx, r)
}

func (s *Storage) FindSavedReq(id string) (models.Request, error) {
	return gorm.G[models.Request](s.db).Where("id = ?", id).First(s.ctx)
}

func (s *Storage) DeleteSavedReq(id string) error {
	_, err := gorm.G[models.Request](s.db).Where("id = ?", id).Delete(s.ctx)
	return err
}

func (s *Storage) GetSavedRequests() ([]models.Request, error) {
	return gorm.G[models.Request](s.db).Find(s.ctx)
}

func (s *Storage) AddDraft(r *models.RequestDraft) error {
	return gorm.G[models.RequestDraft](s.db).Create(s.ctx, r)
}

func (s *Storage) FindDraft(id string) (models.RequestDraft, error) {
	return gorm.G[models.RequestDraft](s.db).Where("id = ?", id).First(s.ctx)
}

func (s *Storage) DeleteDraft(id string) error {
	_, err := gorm.G[models.RequestDraft](s.db).Where("id = ?", id).Delete(s.ctx)

	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) UpdateDraftUrl(id string, url string) (bool, error) {
	r, err := gorm.G[models.RequestDraft](s.db).Where("id = ?", id).Update(s.ctx, "url", url)

	if err != nil {
		return false, err
	}

	return r > 0, nil
}

func (s *Storage) UpdateDraftCollection(id string, collectionId string) (bool, error) {
	r, err := gorm.G[models.Request](s.db).Where("id = ?", id).Update(s.ctx, "collection_id", collectionId)

	if err != nil {
		return false, err
	}

	return r > 0, nil
}

func (s *Storage) UpdateDraftMethod(id string, method string) (bool, error) {
	r, err := gorm.G[models.RequestDraft](s.db).Where("id = ?", id).Update(s.ctx, "method", method)

	if err != nil {
		return false, err
	}

	return r > 0, nil
}

func (s *Storage) UpdateDraftBodyType(id string, bType string) (bool, error) {
	r, err := gorm.G[models.RequestDraft](s.db).Where("id = ?", id).Update(s.ctx, "bodyType", bType)

	if err != nil {
		return false, err
	}

	return r > 0, nil
}

func (s *Storage) UpdateDraftHeaders(id string, headersJson string) (bool, error) {
	r, err := gorm.G[models.RequestDraft](s.db).Where("id = ?", id).Update(s.ctx, "headers",
		datatypes.JSON([]byte(headersJson)),
	)
	if err != nil {
		return false, err
	}

	return r > 0, nil
}

func (s *Storage) UpdateDraftQuery(id string, queryJson string) (bool, error) {
	r, err := gorm.G[models.RequestDraft](s.db).Where("id = ?", id).Update(s.ctx, "query",
		datatypes.JSON([]byte(queryJson)),
	)
	if err != nil {
		return false, err
	}

	return r > 0, nil
}

func (s *Storage) UpdateDraftMultipartForm(id string, multipartJson string) (bool, error) {
	r, err := gorm.G[models.RequestDraft](s.db).Where("id = ?", id).Update(s.ctx, "multipart",
		datatypes.JSON([]byte(multipartJson)),
	)
	if err != nil {
		return false, err
	}

	return r > 0, nil
}

func (s *Storage) UpdateDraftUrlEncodedForm(id string, urlencodedJson string) (bool, error) {
	r, err := gorm.G[models.RequestDraft](s.db).Where("id = ?", id).Update(s.ctx, "urlencoded",
		datatypes.JSON([]byte(urlencodedJson)),
	)
	if err != nil {
		return false, err
	}

	return r > 0, nil
}

func (s *Storage) UpdateDraftTextBody(id string, text string) (bool, error) {
	r, err := gorm.G[models.RequestDraft](s.db).Where("id = ?", id).Update(s.ctx, "textbody", text)
	if err != nil {
		return false, err
	}

	return r > 0, nil
}

func (s *Storage) UpdateDraftBinaryBody(id string, binaryJson string) (bool, error) {
	r, err := gorm.G[models.RequestDraft](s.db).Where("id = ?", id).Update(s.ctx, "binarybody", datatypes.JSON([]byte(binaryJson)))
	if err != nil {
		return false, err
	}

	return r > 0, nil
}

// tabs
func (s *Storage) UpdateOpenTabs(openTabsJson string) error {
	_, err := gorm.G[models.UIState](s.db).Where("id = ?", models.DEFAULT_UI_STATE_ID).Update(s.ctx, "openTabs", datatypes.JSON([]byte(openTabsJson)))

	if err != nil {
		return err
	}

	return nil
}

func (s *Storage) GetUIState() (models.UIState, error) {
	return gorm.G[models.UIState](s.db).Where("id = ?", models.DEFAULT_UI_STATE_ID).First(s.ctx)
}

func (s *Storage) InitializeUIState() error {
	return gorm.G[models.UIState](s.db).Create(s.ctx, &models.UIState{
		Id: models.DEFAULT_UI_STATE_ID,
	})
}

func (s *Storage) SaveDraftAsRequest(dto *models.SaveDraftAsReqDTO) error {

	draft, err := s.FindDraft(dto.DraftId)

	if err != nil {
		return err
	}

	existing, err := s.FindSavedReq(dto.RequestId)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			req := &models.Request{}
			req.FromRequestDraft(dto, &draft)

			createErr := s.AddSavedReq(req)

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
	req := &models.Request{}

	req.FromRequestDraft(dto, &draft)

	createErr := s.AddSavedReq(req)

	if createErr != nil {
		return createErr
	}

	return nil
}
