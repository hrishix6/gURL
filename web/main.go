package main

import (
	"fmt"
	"gurl/shared/db"
	"gurl/shared/utils"
	"gurl/web/internal"
	"gurl/web/internal/config"
	"log"
	"os"
	"path/filepath"
	"slices"
)

func main() {

	cfgFile, ok := os.LookupEnv("CFG_FILE")

	if !ok {
		log.Fatalln("CFG_FILE not configured")
	}

	appCfg := config.LoadWebAppConfig(cfgFile)

	if !slices.Contains([]string{"DEV", "PROD"}, appCfg.Env) {
		appCfg.Env = "PROD"
	}

	log.Printf("[Gurl] env is %s\n", appCfg.Env)

	if appCfg.FrontendURL == "" {
		log.Printf("frontend URL is not set, using localhost. This might not work correctly you want if app is running behind any kind of proxy")
	}

	if appCfg.BackendURL == "" {
		log.Printf("backend URL is not set, using localhost. This might not work correctly you want if app is running behind any kind of proxy")
	}

	if appCfg.Port == 0 {
		appCfg.Port = 80
	}

	appCfg.AppName = fmt.Sprintf("%s_%s", internal.APP_NAME, internal.VERSION)

	baseDataDir := ""

	if appCfg.Env == "PROD" {
		baseDataDir = filepath.Join("/", "usr", "local", "src", internal.APP_NAME)
	} else {
		baseDataDir = "appData"
	}

	if err := utils.InitDataDir(baseDataDir); err != nil {
		log.Fatalf("unable to initialize data directory : %v", err)
	}

	log.Printf("[Gurl] data location: %s \n", baseDataDir)

	if tmpDir, err := utils.InitTempDir(baseDataDir, internal.TEMP_RESPONSES_LOCATION); err != nil {
		log.Fatalf("unable to initialize temp directory : %v", err)
	} else {
		appCfg.BaseTmpDir = tmpDir
	}

	log.Printf("[Gurl] tmp location: %s \n", appCfg.BaseTmpDir)

	if savedResponsesDir, err := utils.InitSavedResponsesDir(baseDataDir, internal.SAVED_RESPONSES_LOCATION); err != nil {
		log.Fatalf("unable to initialize saved responses directory : %v", err)
	} else {
		appCfg.BaseSavedResponsesDir = savedResponsesDir
	}

	log.Printf("[Gurl] saved responses location: %s \n", appCfg.BaseSavedResponsesDir)

	dbConn, err := db.InitWebDb(appCfg.DatabaseURL)

	if err != nil {
		log.Fatalf("unable to establish postgres connection %v", err)
	}

	log.Println("[Gurl] Db connection established")

	InitializeWebApp(&appCfg, dbConn)
}
