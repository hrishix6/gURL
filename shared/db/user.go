package db

import (
	"context"
	"gurl/shared/models"
	"gurl/shared/nanoid"

	"gorm.io/gorm"
)

type User struct {
	BaseEntity
	Username     string `gorm:"column:username;unique"`
	Email        string `gorm:"email;not null"`
	PasswordHash string `gorm:"column:password_hash;not null"`
	IsAdmin      bool   `gorm:"column:is_admin;default:false"`
	IsApproved   bool   `gorm:"column:is_approved;default:false"`
	IsVerified   bool   `gorm:"column:is_verified;default:false"`
}

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

func (usr *UserRepository) CreateUser(ctx context.Context, dto models.CreateUserDTO) (string, error) {

	newUserId := nanoid.Must()

	err := gorm.G[User](usr.db).Create(ctx, &User{
		BaseEntity: BaseEntity{
			Id: newUserId,
		},
		Username:     dto.Username,
		Email:        dto.Email,
		PasswordHash: dto.PasswordHash,
	})

	if err != nil {
		return "", err
	}

	return newUserId, nil
}

func (usr *UserRepository) FindUserByUsername(ctx context.Context, username string) (User, error) {
	return gorm.G[User](usr.db).Where("username = ?", username).First(ctx)
}

func (usr *UserRepository) UpdateUser(ctx context.Context, id string, payload models.UpdateUserDTO) error {

	updates := make(map[string]any)

	if payload.IsAdmin != nil {
		updates["is_admin"] = *payload.IsAdmin
	}

	if payload.IsApproved != nil {
		updates["is_approved"] = *payload.IsApproved
	}

	if payload.IsVerified != nil {
		updates["is_verified"] = *payload.IsVerified
	}

	if len(updates) == 0 {
		return nil
	}

	tx := usr.db.Model(&User{}).Where("id = ?", id).Updates(updates)

	return tx.Error
}
