package db

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"gurl/shared/models"
	"gurl/shared/nanoid"
	"gurl/shared/utils"
	"io"
	"log"
	"net/url"
	"os"
	"path/filepath"
	"slices"

	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Mock struct {
	BaseEntity
	MockCore
	Name         string     `gorm:"column:name"`
	CollectionId string     `gorm:"column:collection_id;not null"`
	Collection   Collection `gorm:"foreignKey:CollectionId;"`
	WorkspaceId  string     `gorm:"column:workspace_id;not null"`
	Workspace    Workspace  `gorm:"foreignKey:WorkspaceId;"`
	UserId       string     `gorm:"column:user_id;not null"`
	User         User       `gorm:"foreignKey:UserId;"`
}

func (m *Mock) FromMockDraft(ctx context.Context, payload *models.SaveMockDraftAsMock, dto *MockDraft) error {

	if m == nil {
		m = &Mock{}
	}

	m.Id = payload.MockId
	m.CollectionId = payload.CollectionId
	m.MockCore = dto.MockCore
	m.WorkspaceId = payload.WorkspaceId
	m.Name = payload.Name
	m.UserId = utils.UserIdFromContext(ctx)

	return nil
}

func (m *Mock) UpdateFromDraft(ctx context.Context, payload *models.SaveMockDraftAsMock, dto *MockDraft) error {

	m.Name = payload.Name
	m.MockCore = dto.MockCore

	//duplicate the binary file
	if string(dto.BinaryBody) != "" {

		var fstats models.FileStats

		err := json.Unmarshal(dto.BinaryBody, &fstats)

		if err != nil {
			return err
		}

		srcF, err := os.Open(fstats.Path)

		if err != nil {
			return err
		}

		dstDir := filepath.Dir(fstats.Path)
		dstExt := filepath.Ext(fstats.Path)

		dstFileName := fmt.Sprintf("gurl-mock-%s%s", nanoid.Must(), dstExt)

		dst := filepath.Join(dstDir, dstFileName)

		dstF, err := os.Create(dst)

		if err != nil {
			return err
		}

		defer dstF.Close()

		n, err := io.Copy(dstF, srcF)

		if err != nil {
			return err
		}

		log.Printf("copied draft binary file to %s, size: %d\n", dst, n)

		binaryB := &models.FileStats{
			Name: dstFileName,
			Size: n,
			Path: dst,
		}

		b, err := json.Marshal(binaryB)

		if err != nil {
			return err
		}

		m.MockCore.BinaryBody = b
	}

	return nil
}

type RequestMockRepository struct {
	db *gorm.DB
}

func NewRequestMockRepository(db *gorm.DB) *RequestMockRepository {
	return &RequestMockRepository{
		db: db,
	}
}

func (rmr *RequestMockRepository) CreateMockFromExample(ctx context.Context, dto models.CreateMockDTO, exampleId string) (*models.MockLightDTO, error) {

	user := utils.UserIdFromContext(ctx)

	existing, err := gorm.G[RequestExample](rmr.db).Where("id = ?", exampleId).First(ctx)

	if err != nil {
		return nil, err
	}

	u, err := url.Parse(existing.Url)

	if err != nil {
		return nil, err
	}

	var renderMeta models.SavedResponseRenderMeta

	err = json.Unmarshal([]byte(existing.ResponseBody), &renderMeta)

	if err != nil {
		return nil, err
	}

	bodyType := "none"

	log.Printf("example response extension is %s", renderMeta.Extension)

	switch renderMeta.Extension {
	case ".json":
		bodyType = "json"
	case ".xml":
		bodyType = "xml"

	case ".txt", ".text":
		bodyType = "plaintext"

	default:
		bodyType = "binary"
	}

	core := MockCore{
		Method:          existing.Method,
		Path:            u.Path,
		ResponseStatus:  existing.ResponseStatus,
		ResponseHeaders: existing.ResponseHeaders,
		ResponseDelayS:  0,
		BodyType:        bodyType,
	}

	srcF, err := os.Open(existing.ResponseSavePath)

	if err != nil {
		return nil, err
	}

	defer srcF.Close()

	if slices.Contains([]string{"json", "xml", "plaintext"}, bodyType) {

		b, err := io.ReadAll(srcF)

		if err != nil {
			return nil, err
		}

		core.TextBody = string(b)

		log.Println("stored in textBody")

	} else {

		dstDir := filepath.Dir(existing.ResponseSavePath)
		dstExt := filepath.Ext(existing.ResponseSavePath)

		dstFileName := fmt.Sprintf("gurl-mock-%s%s", nanoid.Must(), dstExt)
		dst := filepath.Join(dstDir, dstFileName)

		dstF, err := os.Create(dst)

		if err != nil {
			return nil, err
		}

		defer dstF.Close()

		n, err := io.Copy(dstF, srcF)

		binaryB := &models.FileStats{
			Name: dstFileName,
			Size: n,
			Path: dst,
		}

		b, err := json.Marshal(binaryB)

		if err != nil {
			return nil, err
		}

		log.Printf("stored in binaryBody size: %d\n", binaryB.Size)

		core.BinaryBody = b
	}

	rm := Mock{
		BaseEntity: BaseEntity{
			Id: dto.Id,
		},
		Name:         existing.Name,
		MockCore:     core,
		CollectionId: existing.CollectionId,
		WorkspaceId:  existing.WorkspaceId,
		UserId:       user,
	}

	err = gorm.G[Mock](rmr.db).Create(ctx, &rm)

	if err != nil {
		return nil, err
	}

	return &models.MockLightDTO{
		Id:           dto.Id,
		Name:         rm.Name,
		Path:         rm.Path,
		Method:       rm.Method,
		CollectionId: rm.CollectionId,
	}, nil
}

func (rr *RequestMockRepository) AddDraftFromMock(ctx context.Context, id string, dto models.AddDraftDTO) error {

	existing, err := gorm.G[Mock](rr.db).Where("id = ?", id).First(ctx)

	if err != nil {
		return err
	}

	draft := &MockDraft{}

	draft.FromMock(dto.Id, &existing)

	return gorm.G[MockDraft](rr.db).Create(ctx, draft)
}

func (rr *RequestMockRepository) DeleteMockById(ctx context.Context, id string) error {

	user := utils.UserIdFromContext(ctx)

	var m Mock

	err := rr.db.Where(
		"id = ? AND user_id = ?",
		id,
		user,
	).First(&m).Error

	if err != nil {
		return err
	}

	return rr.db.Delete(&m).Error
}

func (rr *RequestMockRepository) DeleteDraftsUnderMock(ctx context.Context, id string) error {

	tx := rr.db.Model(&MockDraft{}).Where("parent_mock_id = ?", id).Updates(map[string]any{
		"parent_mock_id":       "",
		"parent_mock_name":     "",
		"parent_collection_id": "",
	})

	if tx.Error != nil {
		return tx.Error
	}

	return nil

}

func (rr *RequestMockRepository) DeleteDraftsUnderCollection(ctx context.Context, id string) error {

	tx := rr.db.Model(&MockDraft{}).Where("parent_collection_id = ?", id).Updates(map[string]any{
		"parent_mock_id":       "",
		"parent_mock_name":     "",
		"parent_collection_id": "",
	})

	if tx.Error != nil {
		return tx.Error
	}

	return nil

}

func (rr *RequestMockRepository) CreateFreshMockDraft(ctx context.Context, dto models.AddDraftDTO) error {
	return gorm.G[MockDraft](rr.db).Create(ctx, &MockDraft{
		BaseEntity: BaseEntity{
			Id: dto.Id,
		},
		WorkspaceId: dto.WorkspaceId,
	})
}

func (rr *RequestMockRepository) GetMocks(ctx context.Context, query models.MockQueryDTO) ([]models.MockLightDTO, error) {

	user := utils.UserIdFromContext(ctx)

	var records []Mock

	err := rr.db.Where(
		"collection_id = ? AND workspace_id = ? AND user_id = ?",
		query.CollectionId,
		query.WorkspaceId,
		user,
	).Find(&records).Error

	if err != nil {
		return []models.MockLightDTO{}, err
	}

	var results []models.MockLightDTO

	for _, record := range records {

		results = append(results, models.MockLightDTO{
			Id:           record.Id,
			Name:         record.Name,
			Method:       record.Method,
			Path:         record.Path,
			CollectionId: record.CollectionId,
		})
	}

	return results, nil
}

func (rr *RequestMockRepository) GetMockById(ctx context.Context, id string) (*models.MockLightDTO, error) {

	mock, err := gorm.G[Mock](rr.db).Where("id = ? AND user_id = ?", id, utils.UserIdFromContext(ctx)).First(ctx)

	if err != nil {
		return nil, err
	}

	return &models.MockLightDTO{
		Id:           mock.Id,
		Name:         mock.Name,
		Path:         mock.Path,
		Method:       mock.Method,
		CollectionId: mock.CollectionId,
	}, nil
}

func (rr *RequestMockRepository) GetMockDraftById(ctx context.Context, id string) (*models.MockDraftDTO, error) {

	draft, err := gorm.G[MockDraft](rr.db).Where("id = ?", id).First(ctx)

	if err != nil {
		return nil, err
	}

	o := draft.ToMockDraftDTO()

	if c, err := gorm.G[Collection](rr.db).Where("id = ?", draft.ParentCollectionId).First(ctx); err == nil {

		o.CollectionInfo = &models.DraftCollectionInfo{
			Name: c.Name,
		}
	}

	return o, nil
}

func (rr *RequestMockRepository) DeleteMockDraftById(ctx context.Context, id string) error {

	draft, err := gorm.G[MockDraft](rr.db).Where("id = ?", id).First(ctx)

	if err != nil {
		return err
	}

	return rr.db.Delete(&draft).Error
}

func (rr *RequestMockRepository) UpdateMockDraftFields(ctx context.Context, id string, dto models.UpdateMockDraftFields) error {
	updates := make(map[string]any)

	if dto.Method != nil {
		updates["method"] = *dto.Method
	}

	if dto.Path != nil {
		updates["path"] = datatypes.JSON([]byte(*dto.Path))
	}

	if dto.Headers != nil {
		updates["response_headers"] = datatypes.JSON([]byte(*dto.Headers))
	}

	if dto.Cookies != nil {
		updates["response_cookies"] = datatypes.JSON([]byte(*dto.Cookies))
	}

	if dto.BodyType != nil {
		updates["body_type"] = *dto.BodyType
	}

	if dto.TextBody != nil {
		updates["textbody"] = *dto.TextBody
	}

	if dto.BinaryBody != nil {
		if *dto.BinaryBody == "" {
			updates["binarybody"] = datatypes.JSON([]byte(""))
		} else {
			updates["binarybody"] = datatypes.JSON([]byte(*dto.BinaryBody))
		}
	}

	if dto.EnvironmentId != nil {
		updates["environment_id"] = *dto.EnvironmentId
	}

	if dto.Status != nil {
		updates["response_status"] = *dto.Status
	}

	if dto.DelayS != nil {
		updates["response_delay_seconds"] = *dto.DelayS
	}

	if len(updates) == 0 {
		return nil
	}

	tx := rr.db.Model(&MockDraft{}).Where("id = ?", id).Updates(updates)
	return tx.Error
}

func (rr *RequestMockRepository) SaveMockDraftAsMock(ctx context.Context, id string, dto models.SaveMockDraftAsMock) (*models.MockDraftDTO, error) {

	draft, err := gorm.G[MockDraft](rr.db).Where("id = ?", id).First(ctx)

	if err != nil {
		return nil, err
	}

	o := draft.ToMockDraftDTO()

	var collection Collection

	err = rr.db.Where("id = ?", dto.CollectionId).First(&collection).Error

	if err != nil {
		return nil, err
	}

	o.CollectionInfo = &models.DraftCollectionInfo{
		Name: collection.Name,
	}

	existing, err := gorm.G[Mock](rr.db).Where("id = ?", dto.MockId).First(ctx)

	if err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			mock := &Mock{}

			mock.FromMockDraft(ctx, &dto, &draft)

			addErr := gorm.G[Mock](rr.db).Create(ctx, mock)

			if addErr != nil {
				return nil, addErr
			}

			//update draft
			err = rr.db.Model(&MockDraft{}).Where("id = ?", id).Updates(map[string]any{
				"parent_mock_id":       dto.MockId,
				"parent_mock_name":     dto.Name,
				"parent_collection_id": dto.CollectionId,
			}).Error

			if err != nil {
				return nil, err
			}

			return o, nil
		}

		return nil, err
	}

	err = existing.UpdateFromDraft(ctx, &dto, &draft)

	if err != nil {
		return nil, err
	}

	err = rr.db.Save(&existing).Error

	if err != nil {
		return nil, err
	}

	//update draft
	err = rr.db.Model(&MockDraft{}).Where("id = ?", id).Updates(map[string]any{
		"parent_mock_id":       dto.MockId,
		"parent_mock_name":     dto.Name,
		"parent_collection_id": dto.CollectionId,
	}).Error

	if err != nil {
		return nil, err
	}

	return o, nil
}

func (rr *RequestMockRepository) CopyMockWithId(ctx context.Context, id string) (*models.MockLightDTO, error) {

	user := utils.UserIdFromContext(ctx)

	mock, err := gorm.G[Mock](rr.db).Where("id = ?", id).First(ctx)

	if err != nil {
		return nil, err
	}

	copy := Mock{
		BaseEntity: BaseEntity{
			Id: nanoid.Must(),
		},
		Name:         fmt.Sprintf("%s-copy", mock.Name),
		CollectionId: mock.CollectionId,
		WorkspaceId:  mock.WorkspaceId,
		UserId:       user,
	}

	copiedCore, err := mock.CopyMockCore(copy.Id)

	if err != nil {
		return nil, err
	}

	copy.MockCore = *copiedCore

	err = gorm.G[Mock](rr.db).Create(ctx, &copy)

	if err != nil {
		return nil, err
	}

	return &models.MockLightDTO{
		Id:           copy.Id,
		Name:         copy.Name,
		Path:         copy.Path,
		Method:       copy.Method,
		CollectionId: copy.CollectionId,
	}, nil
}
