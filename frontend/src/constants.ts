import type {
	AppTheme,
	DropDownItem,
	ReqBodyType,
	ReqTabId,
	RequestMethod,
	ResTabId,
	TabItem,
	ThemeLabel,
} from "./types";

export const DEFAULT_THEME: AppTheme = "mountain";
export const THEME_LOCALSTORAGE_KEY = "gurl_theme";

export const SUPPORTED_THEMES: ThemeLabel[] = [
	{
		id: "water",
		label: "Water",
	},
	{
		id: "mountain",
		label: "Mountain",
	},
	{
		id: "dracula",
		label: "Dracula",
	},
	{
		id: "lavender",
		label: "Lavender",
	},
	{
		id: "forest",
		label: "Forest",
	},
	{
		id: "night",
		label: "Night",
	},
];

export const REQ_DETAILS_TABS: Readonly<TabItem<ReqTabId>[]> = [
	{
		id: "req_headers",
		Name: "Headers",
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
		id: "res_console",
		Name: "Trace",
	},
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

export const DEFAULT_REQ_TAB: ReqTabId = "req_headers";
export const DEFAULT_RES_TAB: ResTabId = "res_body";
export const DEFAULT_COLLECTION_ID = "gurl_default_collection";

export const QID_PLACEHOLDER = "qid_default";
export const HID_PLACEHOLDER = "hid_default";
export const MULTIPART_ID_PLACEHOLDER = "mid_default";
export const URLENCODED_ID_PLACEHOLDER = "uid_default";
export const DB_NAME = "gurl-db";
export const DB_VERSION = 4;
export const ROOT_USER = "gurl-default-user";
export const MIME_JSON_FILE = "/mime.db.json";
export const APP_VERSION = "v0.3";
