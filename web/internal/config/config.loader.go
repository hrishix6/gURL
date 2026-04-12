package config

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"slices"
	"strings"
)

type MailApiConfig struct {
	Domain string `json:"domain"`
	ApiKey string `json:"api_key"`
}

func (mailApiCfg *MailApiConfig) Validate(parentSuffix string) []string {
	var errors []string

	if mailApiCfg.Domain == "" {
		errors = append(errors, fmt.Sprintf("%s/api_cfg: domain is required", parentSuffix))
	}

	if mailApiCfg.ApiKey == "" {
		errors = append(errors, fmt.Sprintf("%s/api_cfg: api key is required", parentSuffix))
	}

	return errors
}

type MailSmtpConfig struct {
	Host     string `json:"host"`
	Port     int    `json:"port"`
	User     string `json:"user"`
	Password string `json:"password"`
}

func (mailSmtpCfg *MailSmtpConfig) Validate(parentSuffix string) []string {
	suffix := fmt.Sprintf("%s/%s", parentSuffix, "smtp_cfg")

	var errors []string

	if mailSmtpCfg.Host == "" {
		errors = append(errors, fmt.Sprintf("%s: host is required", suffix))
	}

	if mailSmtpCfg.User == "" {
		errors = append(errors, fmt.Sprintf("%s: user is required", suffix))
	}

	if mailSmtpCfg.Password == "" {
		errors = append(errors, fmt.Sprintf("%s: password is required", suffix))
	}

	if mailSmtpCfg.Port == 0 {
		errors = append(errors, fmt.Sprintf("%s: port is required", suffix))
	}

	return errors
}

type MailConfig struct {
	Delivery   string          `json:"mail_delivery"`
	FromAddr   string          `json:"from_address"`
	SmtpConfig *MailSmtpConfig `json:"smtp_cfg"`
	ApiConfig  *MailApiConfig  `json:"api_cfg"`
}

func (mailCfg *MailConfig) Validate(parentSuffix string) []string {

	var errors []string

	if !slices.Contains([]string{
		"api",
		"smtp",
	}, mailCfg.Delivery) {

		errors = append(errors, fmt.Sprintf("%s: type of delivery not set for email, must be 'api' or 'smtp'", parentSuffix))
	}

	if mailCfg.FromAddr == "" {
		errors = append(errors, fmt.Sprintf("%s: sender address not set", parentSuffix))
	}

	if mailCfg.Delivery == "api" {

		if mailCfg.ApiConfig == nil {
			errors = append(errors, fmt.Sprintf("%s: api config is required when delivery type is 'api'", parentSuffix))
		} else {
			apiCfgErrs := mailCfg.ApiConfig.Validate(parentSuffix)
			errors = append(errors, apiCfgErrs...)
		}

	}

	if mailCfg.Delivery == "smtp" {
		if mailCfg.SmtpConfig == nil {
			errors = append(errors, fmt.Sprintf("%s: smtp config is required when delivery type is 'smtp'", parentSuffix))
		} else {
			smtpCfgErrs := mailCfg.SmtpConfig.Validate(parentSuffix)
			errors = append(errors, smtpCfgErrs...)
		}
	}

	return errors
}

type AuthConfig struct {
	JwtSecret         string `json:"jwt_secret"`
	CfTurnstileSecret string `json:"cf_turnstile_secret"`
	CfTurnstyleURL    string `json:"cf_turnstile_url"`
	EnableDemo        bool   `json:"enable_demo"`
}

func (authCfg *AuthConfig) Validate(parentSuffix string) []string {

	var errors []string

	if authCfg.EnableDemo {
		if authCfg.CfTurnstileSecret == "" {
			errors = append(errors, fmt.Sprintf("%s: cloudflare turnstile secret is required", parentSuffix))
		}

		if authCfg.CfTurnstyleURL == "" {
			errors = append(errors, fmt.Sprintf("%s: cloudflare turnstile URL is required", parentSuffix))
		}
	}

	if authCfg.JwtSecret == "" {
		errors = append(errors, fmt.Sprintf("%s: jwt secret is required", parentSuffix))
	}

	return errors
}

type WebApplicationConfig struct {
	AppName               string
	BaseTmpDir            string
	BaseSavedResponsesDir string
	BaseUploadsDir        string
	FrontendURL           string      `json:"frontend_url"`
	BackendURL            string      `json:"backend_url"`
	Env                   string      `json:"env"`
	AuthConfig            *AuthConfig `json:"auth_config"`
	DatabaseURL           string      `json:"database_url"`
	EmailConfig           *MailConfig `json:"mail_cfg"`
	Port                  int         `json:"port"`
}

func LoadWebAppConfig(path string) WebApplicationConfig {

	suffix := "app"
	mailCfgSuffix := fmt.Sprintf("%s/mail_cfg", suffix)
	authCfgSuffix := fmt.Sprintf("%s/auth_cfg", suffix)

	var cfg WebApplicationConfig

	f, err := os.Open(path)

	if err != nil {
		log.Fatalf("unable to read config file %s\n: %v", path, err)
	}

	err = json.NewDecoder(f).Decode(&cfg)

	if err != nil {
		log.Fatalf("unable to parse json config file %s\n: %v", path, err)
	}

	var errors []string

	if cfg.EmailConfig == nil {
		errors = append(errors, fmt.Sprintf("%s: mail config is required", mailCfgSuffix))
	} else {
		emailCfgErrs := cfg.EmailConfig.Validate(mailCfgSuffix)
		errors = append(errors, emailCfgErrs...)
	}

	if cfg.AuthConfig == nil {
		errors = append(errors, fmt.Sprintf("%s: auth config is required", authCfgSuffix))
	} else {
		authCfgErrs := cfg.AuthConfig.Validate(authCfgSuffix)
		errors = append(errors, authCfgErrs...)
	}

	if cfg.DatabaseURL == "" {
		errors = append(errors, fmt.Sprintf("%s/db: database url is required", suffix))
	}

	if len(errors) > 0 {
		log.Fatalf("app configuration validation failed:\n%s", strings.Join(errors, "\n"))
	}

	return cfg
}
