package main

import (
	"fmt"
	"gurl/internal"
	"gurl/internal/db"
	"gurl/internal/models"
	"gurl/internal/utils"
	"gurl/web"
	"log"
	"os"
	"path/filepath"
	"strconv"
)

func main() {

	env, ok := os.LookupEnv("ENV")

	if !ok {
		env = "PROD"
	}

	gurl_url, ok := os.LookupEnv("GURL_URL")

	if !ok {
		log.Printf("GURL_URL not set, using localhost. This might not work correctly you want if app is running behind any kind of proxy")
	}

	portStr, ok := os.LookupEnv("PORT")

	port := 80

	if ok {
		if portNum, err := strconv.Atoi(portStr); err == nil {
			port = portNum
		}
	}

	appName := fmt.Sprintf("%s_%s", internal.APP_NAME, internal.VERSION)

	var dsn string

	log.Printf("[Gurl] env is %s\n", env)

	tmpDir, err := utils.InitTempDir(internal.APP_NAME)

	if err != nil {
		log.Fatalf("unable to initialize temp directory : %v", err)
	}

	log.Printf("[Gurl] tmp location: %s \n", tmpDir)

	baseDataDir := filepath.Join("/", "usr", "local", "src", internal.APP_NAME)

	err = utils.InitDataDir(baseDataDir)

	if err != nil {
		log.Fatalf("unable to initialize data directory : %v", err)
	}

	log.Printf("[Gurl] data location: %s \n", baseDataDir)

	webTmpDir, err := utils.InitWebTempDir(baseDataDir)

	if err != nil {
		log.Fatalf("unable to initialize temp directory : %v", err)
	}

	log.Printf("[Gurl] Web uploads tmp location: %s \n", webTmpDir)

	savedResponsesDir, err := utils.InitSavedResponsesDir(baseDataDir, internal.SAVED_RESPONSES_LOCATION)

	if err != nil {
		log.Fatalf("unable to initialize saved responses directory : %v", err)
	}

	log.Printf("[Gurl] saved responses location: %s \n", savedResponsesDir)

	if env == "PROD" {
		dsn = filepath.Join(baseDataDir, db.DB_NAME)
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

	appInitParams := models.WebAppInitParams{
		AppInitParams: models.AppInitParams{
			Db:                dbConn,
			AppName:           appName,
			SavedResponsesDir: savedResponsesDir,
			TempDir:           tmpDir,
			Env:               env,
		},
		WebTempDir: webTmpDir,
		BaseURL:    gurl_url,
		Port:       port,
	}

	web.InitializeWebApp(appInitParams)
}
