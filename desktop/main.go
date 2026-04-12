package main

import (
	"fmt"
	"gurl/desktop/internal"
	"gurl/shared/db"
	"gurl/shared/models"
	"gurl/shared/utils"
	"log"
	"os"
	"path/filepath"
)

func main() {

	env, ok := os.LookupEnv("GURL_ENV")

	if !ok {
		env = "PROD"
	}

	appName := fmt.Sprintf("%s_%s", internal.APP_NAME, internal.VERSION)

	var dsn string

	log.Printf("[Gurl] env is %s\n", env)

	baseDataDir := ""

	if env == "PROD" {

		userConfig, err := os.UserConfigDir()

		if err != nil {
			log.Fatalf("unable to get base User Config directory : %v", err)
		}

		baseDataDir = userConfig

	} else {
		baseDataDir = "appData"
	}

	baseDataDir = filepath.Join(baseDataDir, internal.APP_NAME)

	err := utils.InitDataDir(baseDataDir)

	if err != nil {
		log.Fatalf("unable to initialize app data directory : %v", err)
	}

	tmpDir, err := utils.InitTempDir(baseDataDir, internal.TEMP_RESPONSES_LOCATION)

	if err != nil {
		log.Fatalf("unable to initialize temp directory : %v", err)
	}

	log.Printf("[Gurl] tmp location: %s \n", tmpDir)

	log.Printf("[Gurl] data location: %s \n", baseDataDir)

	savedResponsesDir, err := utils.InitSavedResponsesDir(baseDataDir, internal.SAVED_RESPONSES_LOCATION)

	if err != nil {
		log.Fatalf("unable to initialize saved responses directory : %v", err)
	}

	log.Printf("[Gurl] saved responses location: %s \n", savedResponsesDir)

	dsn = filepath.Join(baseDataDir, internal.DB_NAME)

	log.Printf("[Gurl] database connection string - %s\n", dsn)

	//initialize DB connection
	dbConn, err := db.InitDesktopDb(dsn)

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

	InitializeDesktopApp(appInitParams)
}
