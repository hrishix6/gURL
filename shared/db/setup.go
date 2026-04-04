package db

import (
	"context"
	"gurl/shared/internal"

	"gorm.io/gorm"
)

type AppSetup struct {
	BaseEntity
	AdminUserConfigured bool `gorm:"column:admin_user_configured;default:false"`
}

type AppSetupRepo struct {
	db *gorm.DB
}

func NewAppSetupRepo(db *gorm.DB) *AppSetupRepo {
	return &AppSetupRepo{
		db: db,
	}
}

func (asr *AppSetupRepo) InitAppSetup(ctx context.Context) error {
	return gorm.G[AppSetup](asr.db).Create(ctx, &AppSetup{
		BaseEntity: BaseEntity{
			Id: internal.APP_SETUP_ID,
		},
	})
}

func (asr *AppSetupRepo) GetAppSetup(ctx context.Context) (AppSetup, error) {
	return gorm.G[AppSetup](asr.db).Where("id = ?", internal.APP_SETUP_ID).First(ctx)
}

func (asr *AppSetupRepo) MarksetupDone(ctx context.Context) error {
	_, err := gorm.G[AppSetup](asr.db).Where("id = ?", internal.APP_SETUP_ID).Update(ctx, "admin_user_configured", true)
	return err
}
