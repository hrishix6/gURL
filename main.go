package main

import (
	"fmt"
	"gurl/desktop"
	"gurl/internal"
	"gurl/internal/db"
	"gurl/internal/models"
	"gurl/internal/utils"
	"log"
	"os"
	"path/filepath"
)

func main() {

	env, ok := os.LookupEnv("ENV")

	if !ok {
		env = "PROD"
	}

	appName := fmt.Sprintf("%s_%s", internal.APP_NAME, internal.VERSION)

	var dsn string

	log.Printf("[Gurl] env is %s\n", env)

	tmpDir, err := utils.InitTempDir(appName)

	if err != nil {
		log.Fatalf("unable to initialize temp directory : %v", err)
	}

	log.Printf("[Gurl] tmp location: %s \n", tmpDir)

	dataBaseDir, err := os.UserConfigDir()

	if err != nil {
		log.Fatalf("unable to get base User Config directory : %v", err)
	}

	appDataDir := filepath.Join(dataBaseDir, appName)

	err = utils.InitDataDir(appDataDir)

	if err != nil {
		log.Fatalf("unable to initialize app data directory : %v", err)
	}

	log.Printf("[Gurl] data location: %s \n", appDataDir)

	savedResponsesDir, err := utils.InitSavedResponsesDir(appDataDir, internal.SAVED_RESPONSES_LOCATION)

	if err != nil {
		log.Fatalf("unable to initialize saved responses directory : %v", err)
	}

	log.Printf("[Gurl] saved responses location: %s \n", savedResponsesDir)

	if env == "PROD" {
		dsn = filepath.Join(appDataDir, db.DB_NAME)
	} else {
		dsn = db.DB_NAME
	}

	log.Printf("[Gurl] database connection string - %s\n", dsn)

	//initialize DB connection
	dbConn, err := db.InitDb(dsn)

	if err != nil {
		log.Fatalf("unable to establish sqlite connection %v", err)
	}

	log.Println("[Gurl] Db connection established")

	appInitParams := models.AppInitParams{
		Db:                dbConn,
		AppName:           appName,
		SavedResponsesDir: savedResponsesDir,
		TempDir:           tmpDir,
		Env:               env,
	}

	desktop.InitializeDesktopApp(appInitParams)
}
