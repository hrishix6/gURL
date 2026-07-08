package workspace

import (
	"fmt"
	"gurl/shared/db"
	"gurl/shared/nanoid"
	"os"
	"testing"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	db.BaseEntity
	Email      string      `gorm:"email;unique;not null"`
	IsAdmin    bool        `gorm:"column:is_admin;default:false"`
	Workspaces []Workspace `gorm:"many2many:workspace_memberships;"`
}

type Workspace struct {
	db.BaseEntity
	Name string `gorm:"column:name"`
}

type WorkspaceMembership struct {
	UserId      string    `gorm:"primaryKey"`
	User        db.User   `gorm:"foreignKey:UserId;"`
	WorkspaceId string    `gorm:"primaryKey"`
	Workspace   Workspace `gorm:"foreignKey:WorkspaceId;"`
	Role        string    `gorm:"column:role;default:'u'"`
}

var testDb *gorm.DB

func TestMain(m *testing.M) {

	membershipDbName := "test_memberships"

	dsn := "postgres://postgres:postgres@localhost:5432/postgres"

	postgresDB, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		panic(err)
	}

	postgresDB.Exec(fmt.Sprintf("DROP DATABASE IF EXISTS \"%s\" WITH (FORCE);", membershipDbName))
	postgresDB.Exec(fmt.Sprintf("CREATE DATABASE %s", membershipDbName))

	dbDsn := fmt.Sprintf("postgres://postgres:postgres@localhost:5432/%s", membershipDbName)

	d, err := gorm.Open(postgres.Open(dbDsn), &gorm.Config{})

	if err != nil {
		panic(err)
	}

	err = d.AutoMigrate(&User{}, &Workspace{}, &WorkspaceMembership{})

	if err != nil {
		panic(err)
	}

	err = d.SetupJoinTable(&User{}, "Workspaces", &WorkspaceMembership{})

	if err != nil {
		panic(err)
	}

	testDb = d
	exitVal := m.Run()

	//cleanup
	os.Exit(exitVal)
}

func runInTx(db *gorm.DB, testFunc func(tx *gorm.DB)) {
	tx := db.Begin()

	defer func() {
		tx.Rollback()
	}()

	testFunc(tx)
}

func TestAssociation(t *testing.T) {
	runInTx(testDb, func(tx *gorm.DB) {

		id := nanoid.Must()
		wantuser := &User{
			BaseEntity: db.BaseEntity{
				Id: id,
			},
			Email: id,
		}

		err := tx.Create(wantuser).Error

		if err != nil {
			t.Error(err)
		}

		var workspaces []Workspace

		err = tx.Model(wantuser).Association("Workspaces").Find(&workspaces)

		if err != nil {
			t.Error(err)
		}
	})
}

func TestAssociationAppend(t *testing.T) {
	runInTx(testDb, func(tx *gorm.DB) {

		id := nanoid.Must()
		wantuser := &User{
			BaseEntity: db.BaseEntity{
				Id: id,
			},
			Email: id,
		}

		err := tx.Create(wantuser).Error

		if err != nil {
			t.Error(err)
		}

		wId := nanoid.Must()

		wantWorkspace := &Workspace{
			BaseEntity: db.BaseEntity{
				Id: wId,
			},
			Name: "workspace",
		}

		err = tx.Create(wantWorkspace).Error

		if err != nil {
			t.Error(err)
		}

		//add association
		err = tx.Create(&WorkspaceMembership{
			UserId:      id,
			WorkspaceId: wId,
			Role:        "o",
		}).Error

		if err != nil {
			t.Error(err)
		}

		//check
		var memberships []WorkspaceMembership

		err = tx.Where("user_id = ?", id).Find(&memberships).Error

		if err != nil {
			t.Error(err)
		}

		if len(memberships) != 1 {
			t.Errorf("expected workspace %s to be associated with user", wId)
		}

		if memberships[0].Role != "o" {
			t.Errorf("expected user %s to be owner of workspace %s but got %s", id, wId, memberships[0].Role)
		}

		for _, m := range memberships {
			fmt.Printf("membership: user id - %s, workspace %s, role %s\n", m.UserId, m.WorkspaceId, m.Role)
		}

	})
}
