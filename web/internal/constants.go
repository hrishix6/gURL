package internal

const (
	APP_NAME                    = "gURL"
	VERSION                     = "v0.9.0"
	SAVED_RESPONSES_PREFIX      = "__gurl_saved__"
	TEMP_RESPONSE_PREFIX        = "__gurl_temp__"
	MAX_RESPONSE_LIMIT_BYTES    = 300_000_000
	MAX_WEB_TEMP_FILE_BYES      = 100_000_000
	SAVED_RESPONSES_LOCATION    = "saved"
	TEMP_RESPONSES_LOCATION     = "tmp"
	JWT_EXPIRY_HOURS            = 24
	MAGIC_LINK_EXPIRY_MINS      = 10
	DEMO_USER_ID_PREFIX         = "gurl_demo_user"
	DEMO_USER_JWT_EXPIRY_MINS   = 5
	DEMO_USER_WORKSPACE_PREFIX  = "gurl_demo_workspace"
	DEMO_USER_UISTATE_PREFIX    = "gurl_demo_uistate"
	DEMO_USER_ENV_PREFIX        = "gurl_demo_env"
	DEMO_USER_COLLECTION_PREFIX = "gurl_demo_collection"
	CF_TURNSTILE_CHALLENGE_URL  = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
)
