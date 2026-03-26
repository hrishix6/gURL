import type { models } from "@wailsjs/go/models";

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

export type ReqTabId =
	| "req_headers"
	| "req_path"
	| "req_query"
	| "req_body"
	| "req_auth"
	| "req_cookies";

export type ResTabId =
	| "res_headers"
	| "res_body"
	| "res_console"
	| "res_cookies";

export type RequestAuthType = "no_auth" | "basic" | "token" | "api_key";

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

export interface EnvironmentItem {
	id: string;
	key: string;
	val: string;
	isSecret: boolean;
	description: string;
}

export interface MultipartItem {
	id: string;
	key: string;
	val: string | models.FileStats;
	enabled: string;
}

export interface TabItem<T> {
	id: T;
	Name: string;
	hasIndicator?: boolean;
	indicatorVal?: number | string;
}

export type ResStatsType = Pick<
	models.GurlRes,
	| "size"
	| "status"
	| "statusText"
	| "time"
	| "success"
	| "ttfbMs"
	| "uploadSize"
> | null;

export interface RequestTabItem {
	id: string;
	method: RequestMethod;
	title: string;
}

export type AppState = "initializing" | "loaded" | "error";

export interface DropDownItem<T> {
	id: T;
	displayName: string;
	isTitle?: boolean;
}

export enum AppTabType {
	Req = "req",
	Env = "env",
	Pref = "pref",
	ReqExample = "req_example",
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
	isModified: boolean;
}

export interface ActiveItemInfo {
	show: boolean;
	parent: string;
	child: string;
	type: AppTabType;
}

export enum AppSidebarContent {
	History = "history",
	Collections = "collections",
	Environments = "environments",
}

export type BasicAuth = Pick<models.BasicAuth, "username" | "password">;
export type APIKeyLocation = "header" | "query";
export type ApiKeyAuth = Pick<models.ApiKeyAuth, "key" | "location" | "value">;
export type TokenAuth = Pick<models.TokenAuth, "token" | "type">;
export type TokenAuthType =
	| "bearer"
	| "digest"
	| "hoba"
	| "mutual"
	| "aws4-hmac-sha256";

export interface ReqHistoryItem {
	id: string;
	url: string;
	method: RequestMethod;
	headers: models.GurlKeyValItem[];
	queryParams: models.GurlKeyValItem[];
	path: models.GurlKeyValItem[];
	bodyType: ReqBodyType;
	cookies: models.GurlKeyValItem[];
	multiPartBody: MultipartItem[];
	urlEncodedBody: models.GurlKeyValItem[];
	binaryBody: models.FileStats | null;
	textBody: string;
	statusText: string;
	success: boolean;
	executed: number; //unix timestamp when this was executed
	tokenAuth: TokenAuth | null;
	basicAuth: BasicAuth | null;
	apiKeyAuth: ApiKeyAuth | null;
	authType: RequestAuthType | null;
	authEnabled: boolean;
}

export enum FormLayout {
	Horizontal = "h",
	Vertical = "v",
	Responsive = "r",
}

export interface EnvironmentDraftParent {
	parentEnvId: string;
	parentEnvName: string;
}

export interface Alert {
	id: string;
	type: "success" | "error";
	message: string;
	selfDestruct?: boolean;
	selfDestructTimeMS?: number;
}

export type GlobalEnvMap = Record<string, Record<string, string>>;

export interface AppConfig {
	mode: string;
	backend_url: string;
	appVersion: string;
}

export interface InputToken {
	type: "env" | "text" | "path";
	value: string;
	valid: boolean;
	key: string;
	interpolated: string;
}

export interface WorkspaceRepository {
	getWorkspaces(): Promise<Array<models.WorkspaceLightDTO> | undefined | null>;
	getWorkspaceById(id: string): Promise<models.WorkspaceDTO>;
	addWorkspace(arg: models.CreateWorkspaceDTO): Promise<void>;
	updateWorkspace(id: string, arg: models.UpdateWorkspaceDTO): Promise<void>;
}

export interface CollectionRepository {
	getAllCollections(workspace: string): Promise<Array<models.CollectionDTO> | undefined | null>;
	addCollection(dto: models.CreateCollectionDTO): Promise<void>;
	clearCollection(arg1: string): Promise<void>;
	deleteCollection(arg1: string): Promise<void>;
	deleteDraftsUnderCollection(arg1: string): Promise<void>;
	renameCollection(id: string, newName: string): Promise<void>;
}

export interface EnvironmentRepository {
	addFreshEnvDraft(arg1: string): Promise<void>;
	addEnvironmentDraft(arg1: models.AddEnvironmentDraftDTO): Promise<void>;
	copyEnvironment(
		sourceId: string,
		arg1: models.CopyEnvironmentDTO,
	): Promise<void>;
	getEnvironments(workspace: string): Promise<Array<models.EnvironmentDTO> | undefined | null>;
	findEnvDraft(arg1: string): Promise<models.EnvironmentDraftDTO>;
	removeEnv(arg1: string): Promise<void>;
	removeEnvDraft(arg1: string): Promise<void>;
	saveEnvDraftAsEnv(
		draftId: string,
		arg1: models.SaveEnvDraftAsEnvDTO,
	): Promise<void>;
	updateEnvDraftData(
		draftId: string,
		arg1: models.UpdateEnvDraftDataDTO,
	): Promise<void>;
	deleteEnvDraftsUnderEnv(arg1: string): Promise<void>;
}

export interface Exporter {
	exportCollection(id: string, name: string): Promise<void>;
	exportEnvironment(id: string, name: string): Promise<void>;
	importCollection(workspaceId: string, file?: File): Promise<void>;
	importEnvironment(workspaceId: string, file?: File): Promise<void>;
}

export interface RequestRepository {
	addDraft(arg1: models.RequestDraftDTO): Promise<void>;
	addDraftFromRequest(id: string, arg1: models.AddDraftDTO): Promise<void>;
	addFreshDraft(arg1: models.AddDraftDTO): Promise<void>;
	removeDraft(arg1: string): Promise<void>;
	addReqExample(
		arg1: models.ReqExampleDTO,
		arg2: models.SavedResponseRenderMeta,
	): Promise<void>;
	deleteReqExample(arg1: string): Promise<void>;
	deleteRequestDrafts(arg1: string): Promise<void>;
	deleteSavedReq(arg1: string): Promise<void>;
	findDraftById(arg1: string): Promise<models.RequestDraftDTO>;
	getReqExampleById(arg1: string): Promise<models.ReqExampleDTO>;
	getReqExamples(workspace: string): Promise<Array<models.ReqExampleLightDTO> | undefined | null>;
	getSavedRequests(workspace: string): Promise<Array<models.RequestLightDTO> | undefined | null>;
	saveDraftAsRequest(
		draftId: string,
		arg1: models.SaveDraftAsReqDTO,
	): Promise<void>;
	saveRequestCopy(
		requestId: string,
		arg1: models.SaveRequestCopyDTO,
	): Promise<void>;
	updatereqDraftFields(
		draftId: string,
		arg: models.UpdateDraftFieldsDTO,
	): Promise<void>;
}

export interface UIStateRepository {
	getUIState(): Promise<models.UIStateDTO>;
	updateUIState(arg: models.UpdateUIStateDTO): Promise<void>;
}

export interface FileRepository {
	saveFile(arg1: models.DownloadTmpFileDTO): Promise<void>;
	chooseFile(file?: File): Promise<models.FileStats>;
}

export interface HttpExecutor {
	cancelReq(arg1: string): Promise<void>;
	getSavedResponsesSrc(arg1: string): Promise<string>;
	parseCookieRaw(arg1: string): Promise<Array<models.GurlKeyValItem>>;
	sendHttpReq(arg1: models.GurlReq): Promise<models.GurlRes>;
}

export interface ApiResponse<T> {
	data?: T;
	metadata: {
		timestamp: string;
		request_id: string;
	};
	error?: {
		message: string;
		details: string;
	};
}

export interface WebImportDTO {
	workspace_id: string;
	file_path: string;
}
