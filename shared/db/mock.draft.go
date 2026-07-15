package db

import "gurl/shared/models"

type MockDraft struct {
	BaseEntity
	MockCore
	ParentMockId       string    `gorm:"column:parent_mock_id"`
	ParentMockName     string    `gorm:"column:parent_mock_name"`
	ParentCollectionId string    `gorm:"column:parent_collection_id"`
	WorkspaceId        string    `gorm:"column:workspace_id;not null"`
	Workspace          Workspace `gorm:"foreignKey:WorkspaceId;"`
}

func (md *MockDraft) ToMockDraftDTO() *models.MockDraftDTO {
	return &models.MockDraftDTO{
		Id:                 md.Id,
		MockCoreDTO:        md.ToMockCoreDTO(),
		ParentMockId:       md.ParentMockId,
		ParentMockName:     md.ParentMockName,
		ParentCollectionId: md.ParentCollectionId,
	}
}

func (md *MockDraft) FromMock(id string, m *Mock) {

	if md == nil {
		md = &MockDraft{}
	}

	md.Id = id
	md.MockCore = m.MockCore
	md.ParentMockId = m.Id
	md.ParentMockName = m.Name
	md.ParentCollectionId = m.CollectionId
	md.WorkspaceId = m.WorkspaceId
}
