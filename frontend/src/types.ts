import type { models } from "../wailsjs/go/models";

export type ReqState = "idle" | "progress" | "aborted" | "error" | "success";

export type RequestMethod =
	| "GET"
	| "POST"
	| "PATCH"
	| "PUT"
	| "DELETE"
	| "OPTIONS"
	| "HEAD";

export type ReqBodyType =
	| "none"
	| "multipart"
	| "urlencoded"
	| "json"
	| "xml"
	| "plaintext"
	| "binary"
	| "txt"
	| "form";

export type ReqTabId = "req_headers" | "req_query" | "req_body" | "req_auth";
export type ResTabId = "res_headers" | "res_body" | "res_console";
export type RequestAuthType = "no_auth" | "basic" | "bearer" | "api_key";

export type AppTheme =
	| "dracula"
	| "forest"
	| "water"
	| "mountain"
	| "lavender"
	| "night";

export interface ThemeLabel {
	id: AppTheme;
	label: string;
}

export interface KeyValItem {
	id: string;
	key: string;
	val: string;
	enabled: string;
}

export interface MultipartItem {
	id: string;
	key: string;
	val: string | models.FileStats;
	enabled: string;
}

export type RequestHeaders = KeyValItem[];
export type RequestQuery = KeyValItem[];

export interface TabItem<T> {
	id: T;
	Name: string;
	hasIndicator?: boolean;
	indicatorVal?: number | string;
}

export type ResStatsType = Pick<
	models.GurlRes,
	"size" | "status" | "statusText" | "time" | "success"
> | null;

export interface RequestTabItem {
	id: string;
	method: RequestMethod;
	title: string;
}

export type AppState = "initializing" | "loaded" | "error";

export enum HeaderEvent {
	Update = "update",
	Delete = "delete",
}

export interface DropDownItem<T> {
	id: T;
	displayName: string;
}

export type HeaderUpdateEventPayload = {
	id: string;
	prop: Exclude<keyof KeyValItem, "id">;
	event: HeaderEvent.Update;
	v: string;
};

export type HeaderDeleteEventPayload = {
	id: string;
	event: HeaderEvent.Delete;
};

export type HeaderEventPayload =
	| HeaderUpdateEventPayload
	| HeaderDeleteEventPayload;

export type CollectionRequestItem = Pick<
	models.RequestDTO,
	"id" | "method" | "url" | "name" | "collectionId"
>;

export enum AppTabType {
	Req = "req",
	Env = "env",
	Pref = "pref",
}

export interface DraftParentMetadata {
	parentRequestId: string;
	parentCollectionId: string;
	parentRequestName: string;
}

export interface ApplicationTab {
	id: string;
	tag: string;
	name: string;
	entityType: AppTabType;
	entityId: string;
}

export enum AppSidebarContent {
	History = "history",
	Collections = "collections",
}

export interface ReqHistoryItem {
	id: string;
	url: string;
	method: RequestMethod;
	headers: RequestHeaders;
	queryParams: RequestQuery;
	bodyType: ReqBodyType;
	multiPartBody: MultipartItem[];
	urlEncodedBody: KeyValItem[];
	binaryBody: models.FileStats | null;
	textBody: string;
	statusText: string;
	success: boolean;
	executed: number; //unix timestamp when this was executed
}

export enum FormLayout {
	Horizontal = "h",
	Vertical = "v",
	Responsive = "r",
}
