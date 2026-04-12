package db

import (
	"context"
	"gurl/shared/models"
	"gurl/shared/nanoid"
	"log"
	"time"

	"gorm.io/gorm"
)

type User struct {
	BaseEntity
	Email   string `gorm:"email;unique;not null"`
	IsAdmin bool   `gorm:"column:is_admin;default:false"`
}

// Hooks
func (u *User) BeforeDelete(tx *gorm.DB) error {

	log.Printf("before delete hook called user %s \n", u.Id)

	var workspaces []Workspace

	if err := tx.Where("user_id = ?", u.Id).Find(&workspaces).Error; err != nil {
		return err
	}

	for _, w := range workspaces {

		if err := tx.Delete(&w).Error; err != nil {
			return err
		}

	}

	var uiState UIState

	if err := tx.Where("user_id = ?", u.Id).First(&uiState).Error; err != nil {
		return err
	}

	return tx.Delete(&uiState).Error
}

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{
		db: db,
	}
}

func (usr *UserRepository) CreateDemoUser(ctx context.Context, demoId string) error {

	err := gorm.G[User](usr.db).Create(ctx, &User{
		BaseEntity: BaseEntity{
			Id: demoId,
		},
		Email: demoId,
	})

	if err != nil {
		return err
	}

	return nil
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

func (usr *UserRepository) DeleteUserById(ctx context.Context, id string) error {

	user, err := usr.FindUserById(ctx, id)

	if err != nil {
		return err
	}

	return usr.db.Delete(&user).Error
}

func (usr *UserRepository) DeleteUser(user *User) error {
	return usr.db.Delete(user).Error
}

func (usr *UserRepository) FindUserById(ctx context.Context, id string) (User, error) {
	return gorm.G[User](usr.db).Where("id = ?", id).First(ctx)
}

func (usr *UserRepository) FindUserByEmail(ctx context.Context, email string) (User, error) {
	return gorm.G[User](usr.db).Where("email = ?", email).First(ctx)
}

func (usr *UserRepository) FindExpiredDemoUsers() ([]User, error) {

	cutOff := time.Now().Add(-10 * time.Minute).Unix()

	var u []User

	if err := usr.db.Where("created < ? AND id LIKE 'gurl_demo_user%'", cutOff).Find(&u).Error; err != nil {
		return nil, err
	}

	return u, nil
}
