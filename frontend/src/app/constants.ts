import {
	type APIKeyLocation,
	type AppTheme,
	type DropDownItem,
	FormLayout,
	type ReqBodyType,
	type ReqTabId,
	type RequestAuthType,
	type RequestMethod,
	type ResTabId,
	type TabItem,
	type ThemeLabel,
	type TokenAuthType,
} from "./types";

export const DEFAULT_THEME: AppTheme = "mountain";
export const THEME_LOCALSTORAGE_KEY = "gurl_theme";

export const SUPPORTED_LAYOUTS: DropDownItem<FormLayout>[] = [
	{ id: FormLayout.Horizontal, displayName: "Horizontal" },
	{ id: FormLayout.Vertical, displayName: "Vertical" },
	{ id: FormLayout.Responsive, displayName: "Auto" },
];

export const SUPPORTED_THEMES: ThemeLabel[] = [
	{
		id: "dracula",
		label: "Dracula",
	},
	{
		id: "forest",
		label: "Forest",
	},
	{
		id: "lavender",
		label: "Lavender",
	},
	{
		id: "mountain",
		label: "Mountain",
	},
	{
		id: "night",
		label: "Night",
	},
	{
		id: "water",
		label: "Water",
	},
];

export const REQ_DETAILS_TABS: Readonly<TabItem<ReqTabId>[]> = [
	{
		id: "req_headers",
		Name: "Headers",
	},
	{
		id: "req_path",
		Name: "Path",
	},
	{
		id: "req_query",
		Name: "Query",
	},
	{
		id: "req_body",
		Name: "Body",
	},
	{
		id: "req_auth",
		Name: "Auth",
	},
	{
		id: "req_cookies",
		Name: "Cookies",
	},
];

export const RES_DETAILS_TABS: readonly TabItem<ResTabId>[] = [
	{
		id: "res_body",
		Name: "Response",
	},
	{
		id: "res_headers",
		Name: "Headers",
	},
	{
		id: "res_cookies",
		Name: "Cookies",
	},
	// {
	// 	id: "res_console",
	// 	Name: "Trace",
	// },
];

export const REQ_BODY_TYPES: readonly DropDownItem<ReqBodyType>[] = [
	{
		id: "none",
		displayName: "None",
	},
	{
		id: "binary",
		displayName: "File",
	},
	{
		id: "json",
		displayName: "Json",
	},
	{
		id: "xml",
		displayName: "Xml",
	},
	{
		id: "plaintext",
		displayName: "Plain",
	},
	{
		id: "multipart",
		displayName: "Multipart",
	},
	{
		id: "urlencoded",
		displayName: "URL Encoded",
	},
];

export const REQ_METHODS: readonly DropDownItem<RequestMethod>[] = [
	{
		id: "GET",
		displayName: "Get",
	},
	{
		id: "POST",
		displayName: "Post",
	},
	{
		id: "PUT",
		displayName: "Put",
	},
	{
		id: "PATCH",
		displayName: "Patch",
	},
	{
		id: "DELETE",
		displayName: "Delete",
	},
	{
		id: "OPTIONS",
		displayName: "Options",
	},
	{
		id: "HEAD",
		displayName: "Head",
	},
];

export const REQ_AUTH_TYPES: readonly DropDownItem<RequestAuthType>[] = [
	{
		id: "no_auth",
		displayName: "No Auth",
	},
	{
		id: "basic",
		displayName: "Basic",
	},
	{
		id: "token",
		displayName: "Token",
	},
	{
		id: "api_key",
		displayName: "API Key",
	},
];

export const TOKEN_AUTH_TYPES: readonly DropDownItem<TokenAuthType>[] = [
	{
		id: "bearer",
		displayName: "Bearer",
	},
];

export const API_KEY_LOCATION: readonly DropDownItem<APIKeyLocation>[] = [
	{
		id: "header",
		displayName: "in header",
	},
	{
		id: "query",
		displayName: "in query",
	},
];

export const BULK_EDIT_INSTRUCTION =
	"Keep each entry on new line\nKey & value are delimited by ' : '\nStart row with ' # ' to keep entry disabled";
export const BULK_EDIT_COOKIES_INSTRUCTION =
	"Keep entries separated by ' ; '\nName & Value are delimited by ' = '";

export const DEFAULT_REQ_TAB: ReqTabId = "req_headers";
export const DEFAULT_RES_TAB: ResTabId = "res_body";
export const DEFAULT_COLLECTION_ID = "gurl_default_collection";

export const NO_ENV_ID = "no_env";
export const ENV_TOKEN_REGEX = /({{.*?}})/g;
export const ENV_VAR_REGEX = /{{(.*?)}}/;
export const PATH_TOKEN_REGEX = /({.*?})/g;
export const PATH_VAR_REGEX = /{(.*?)}/;

export const COMBINED_ENV_PATH_REGEX = /(\{\{[^{}]+\}\}|\{[^{}]+\})/g;

export const QID_PLACEHOLDER = "qid_default";
export const HID_PLACEHOLDER = "hid_default";
export const COOKIE_PLACEHOLDER = "cookie_default";
export const MULTIPART_ID_PLACEHOLDER = "mid_default";
export const URLENCODED_ID_PLACEHOLDER = "uid_default";
export const ENV_ID_PLACEHOLDER = "eid_default";
export const DB_NAME = "gurl-db";
export const DB_VERSION = 4;
export const ROOT_USER = "gurl-default-user";
export const DL_LIMIT_BYTES = 300_000_000;
export const MIME_JSON_FILE = "/mime.db.json";
export const CONFIG_FILE_PATH = "/config.json";
