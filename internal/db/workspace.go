package db

import "gorm.io/datatypes"

type Workspace struct {
	BaseEntity
	Name      string         `gorm:"column:name"`
	OpenTabs  datatypes.JSON `gorm:"column:openTabs;default:'[]'"`
	ActiveTab string         `gorm:"column:activeTab"`
}
