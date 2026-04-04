package db

import (
	"context"
	"gurl/shared/models"
	"gurl/shared/nanoid"

	"gorm.io/gorm"
)

type User struct {
	BaseEntity
	Email   string `gorm:"email;unique;not null"`
	IsAdmin bool   `gorm:"column:is_admin;default:false"`
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
		Email: dto.Email,
	})

	if err != nil {
		return "", err
	}

	return newUserId, nil
}

func (usr *UserRepository) CreateAdminUser(ctx context.Context, dto models.CreateUserDTO) (string, error) {

	newUserId := nanoid.Must()

	err := gorm.G[User](usr.db).Create(ctx, &User{
		BaseEntity: BaseEntity{
			Id: newUserId,
		},
		Email:   dto.Email,
		IsAdmin: true,
	})

	if err != nil {
		return "", err
	}

	return newUserId, nil
}

func (usr *UserRepository) FindUserById(ctx context.Context, id string) (User, error) {
	return gorm.G[User](usr.db).Where("id = ?", id).First(ctx)
}

func (usr *UserRepository) FindUserByEmail(ctx context.Context, email string) (User, error) {
	return gorm.G[User](usr.db).Where("email = ?", email).First(ctx)
}
