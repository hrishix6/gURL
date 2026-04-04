package main

import (
	"fmt"
	"gurl/shared/db"
	"gurl/shared/models"
	"gurl/shared/utils"
	"gurl/web/internal"
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

	gurl_fe_url, ok := os.LookupEnv("GURL_FRONTEND_URL")

	if !ok {
		log.Printf("GURL_FRONTEND_URL not set, using localhost. This might not work correctly you want if app is running behind any kind of proxy")
	}

	gurl_be_url, ok := os.LookupEnv("GURL_BACKEND_URL")

	if !ok {
		log.Printf("GURL_BACKEND_URL not set, using localhost. This might not work correctly you want if app is running behind any kind of proxy")
	}

	portStr, ok := os.LookupEnv("PORT")

	port := 80

	if ok {
		if portNum, err := strconv.Atoi(portStr); err == nil {
			port = portNum
		}
	}

	appName := fmt.Sprintf("%s_%s", internal.APP_NAME, internal.VERSION)

	log.Printf("[Gurl] env is %s\n", env)

	tmpDir, err := utils.InitTempDir(internal.APP_NAME)

	if err != nil {
		log.Fatalf("unable to initialize temp directory : %v", err)
	}

	log.Printf("[Gurl] tmp location: %s \n", tmpDir)

	baseDataDir := ""

	if env == "PROD" {
		baseDataDir = filepath.Join("/", "usr", "local", "src", internal.APP_NAME)
	} else {
		baseDataDir = "appData"
	}

	err = utils.InitDataDir(baseDataDir)

	if err != nil {
		log.Fatalf("unable to initialize data directory : %v", err)
	}

	log.Printf("[Gurl] data location: %s \n", baseDataDir)

	webTmpDir, err := utils.InitWebTempDir(baseDataDir)

	if err != nil {
		log.Fatalf("unable to initialize web temp directory : %v", err)
	}

	log.Printf("[Gurl] Web uploads tmp location: %s \n", webTmpDir)

	savedResponsesDir, err := utils.InitSavedResponsesDir(baseDataDir, internal.SAVED_RESPONSES_LOCATION)

	if err != nil {
		log.Fatalf("unable to initialize saved responses directory : %v", err)
	}

	log.Printf("[Gurl] saved responses location: %s \n", savedResponsesDir)

	dsn := ""

	if d, ok := os.LookupEnv("DATABASE_URL"); !ok || d == "" {
		log.Fatalf("DATABASE_URL environment variable not configured")
	} else {
		dsn = d
	}

	dbConn, err := db.InitWebDb(dsn)

	if err != nil {
		log.Fatalf("unable to establish postgres connection %v", err)
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
		WebTempDir:  webTmpDir,
		BackendURL:  gurl_be_url,
		FrontendURL: gurl_fe_url,
		Port:        port,
	}

	InitializeWebApp(appInitParams)
}
