package db

import "gorm.io/datatypes"

type UIState struct {
	BaseEntity
	OpenTabs               datatypes.JSON `gorm:"column:openTabs;default:'[]'"`
	ActiveTab              string         `gorm:"column:activeTab"`
	IsSidebarOpen          bool           `gorm:"column:sidebarOpen;default:false"`
	AlwaysDiscardDrafts    bool           `gorm:"column:alwaysDiscardDrafts;default:false"`
	AlwaysDiscardEnvDrafts bool           `gorm:"column:alwaysDiscardEnvDrafts;default:false"`
	Layout                 string         `gorm:"column:layout;default:r"`
}
