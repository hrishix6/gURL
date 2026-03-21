package db

type UIState struct {
	BaseEntity
	IsSidebarOpen          bool   `gorm:"column:sidebarOpen;default:false"`
	AlwaysDiscardDrafts    bool   `gorm:"column:alwaysDiscardDrafts;default:false"`
	AlwaysDiscardEnvDrafts bool   `gorm:"column:alwaysDiscardEnvDrafts;default:false"`
	Layout                 string `gorm:"column:layout;default:r"`
	ActiveWorkspace        string `gorm:"column:activeWorkspace;default:''"`
}
