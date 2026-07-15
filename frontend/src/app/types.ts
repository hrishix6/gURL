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

export type MockBodyType = "none" | "json" | "xml" | "plaintext" | "binary";

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

export type MockTabId = "mock_meta" | "mock_body" | "mock_vars";

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
	Mock = "mock",
}

export interface DraftParentMetadata {
	parentRequestId: string;
	parentCollectionId: string;
	parentRequestName: string;
}

export interface MockParentMetadata {
	parentMockId: string;
	parentCollectionId: string;
	parentMockName: string;
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

export enum CrumbType {
	Req = "Request",
	Collections = "Collection",
	Env = "Environment",
	ReqExample = "Request_Example",
	Mock = "Mock",
	MockServer = "MockServer",
}

export interface Crumb {
	type: CrumbType;
	name: string;
}

export interface CrumbInfo {
	collection?: string;
	request?: string;
	entityName: string;
	mockServer?: string;
}

export enum AppSidebarContent {
	History = "history",
	Collections = "collections",
	Environments = "environments",
	MockServers = "mock-servers",
	UserSettings = "user-settings",
}

export interface FetchState {
	loaded: boolean;
	loading: boolean;
	error: boolean;
	attempts: number;
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
	mode: "desktop" | "web";
	api_url: string;
	auth_url: string;
	appVersion: string;
	setup_required: boolean;
	demo_enabled: boolean;
	env: "DEV" | "PROD";
	deployment: "public" | "private";
	mockSrvBaseUrl: string;
}

export interface MockCallingInfo {
	url: string;
	auth: {
		key: string;
		val: string;
	};
	match?: {
		key: string;
		val: string;
	};
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
	getWorkspaceById(id: string): Promise<models.WorkspaceDTO | undefined>;
	addWorkspace(arg: models.CreateWorkspaceDTO): Promise<void>;
	updateWorkspace(id: string, arg: models.UpdateWorkspaceDTO): Promise<void>;
}

export interface CollectionRepository {
	getAllCollections(
		query: models.CollectionsQueryDTO,
	): Promise<Array<models.CollectionDTO> | undefined | null>;
	addCollection(dto: models.CreateCollectionDTO): Promise<void>;
	clearCollection(arg1: string): Promise<void>;
	deleteCollection(arg1: string): Promise<void>;
	renameCollection(id: string, newName: string): Promise<void>;
	getCollectionById(
		id: string,
	): Promise<models.CollectionDTO | undefined | null>;

	createMockServer(
		query: models.CreateMockServerDTO,
	): Promise<models.CollectionDTO>;
	updateMockServer(id: string, flag: boolean): Promise<models.CollectionDTO>;
}

export interface EnvironmentRepository {
	addFreshEnvDraft(dto: models.AddFreshEnvDraftDTO): Promise<void>;
	addEnvironmentDraft(arg1: models.AddEnvironmentDraftDTO): Promise<void>;
	copyEnvironment(
		sourceId: string,
		arg1: models.CopyEnvironmentDTO,
	): Promise<void>;
	getEnvironments(
		query: models.EnvsQueryDTO,
	): Promise<Array<models.EnvironmentDTO> | undefined | null>;
	findEnvDraft(arg1: string): Promise<models.EnvironmentDraftDTO | undefined>;
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
	importCollection(workspaceId: string, file?: File): Promise<string>;
	importEnvironment(workspaceId: string, file?: File): Promise<void>;
}

export interface ReqMockRepository {
	getMockById(id: string): Promise<models.MockLightDTO>;
	getMocks(query: models.MockQueryDTO): Promise<models.MockLightDTO[]>;
	deleteMockById(id: string): Promise<void>;
	copyMockWithId(id: string): Promise<models.MockLightDTO>;
	createFreshMockDraft(dto: models.AddDraftDTO): Promise<void>;
	getMockDraftById(id: string): Promise<models.MockDraftDTO>;
	deleteMockDraftById(id: string): Promise<void>;
	createMockDraftFromMock(
		mockId: string,
		dto: models.AddDraftDTO,
	): Promise<void>;
	updateMockDraftFields(
		id: string,
		dto: models.UpdateMockDraftFields,
	): Promise<void>;
	saveMockDraftAsMock(
		draftId: string,
		dto: models.SaveMockDraftAsMock,
	): Promise<models.MockDraftDTO>;
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
	deleteSavedReq(arg1: string): Promise<void>;
	findDraftById(arg1: string): Promise<models.RequestDraftDTO | undefined>;
	getSavedReqById(id: string): Promise<models.RequestLightDTO | undefined>;
	getReqExampleById(arg1: string): Promise<models.ReqExampleDTO | undefined>;
	getReqExamples(
		query: models.ReqExampleQueryDTO,
	): Promise<Array<models.ReqExampleLightDTO> | undefined | null>;
	getSavedRequests(
		query: models.ReqQueryDTO,
	): Promise<Array<models.RequestLightDTO> | undefined | null>;
	saveDraftAsRequest(
		draftId: string,
		arg1: models.SaveDraftAsReqDTO,
	): Promise<models.RequestDraftDTO | null | undefined>;
	saveRequestCopy(
		requestId: string,
		arg1: models.SaveRequestCopyDTO,
	): Promise<string>;
	updatereqDraftFields(
		draftId: string,
		arg: models.UpdateDraftFieldsDTO,
	): Promise<void>;

	createMockFromExample(
		exampleId: string,
		dto: models.CreateMockDTO,
	): Promise<models.MockLightDTO>;
}

export interface UIStateRepository {
	getUIState(): Promise<models.UIStateDTO>;
	updateUIState(arg: models.UpdateUIStateDTO): Promise<void>;
}

export interface FileRepository {
	downloadResponseFile(arg1: models.DownloadTmpFileDTO): Promise<void>;
	chooseFile(file?: File): Promise<models.FileStats>;
}

export interface HttpExecutor {
	cancelReq(arg1: string): Promise<void>;
	getSavedResponsesSrc(arg1: string): Promise<string>;
	parseCookieRaw(arg1: string): Promise<Array<models.GurlKeyValItem>>;
	sendHttpReq(arg1: models.GurlReq, envId: string): Promise<models.GurlRes>;
	getInterpolatedReq(r: models.GurlReq, envId: string): Promise<models.GurlReq>;
}

export type ApiRequestMeta = {
	timestamp: string;
	request_id: string;
};

export type ApiErrorResponse = {
	success: false;
	metadata: ApiRequestMeta;
	error: {
		message: string;
		details: unknown;
	};
};

export type ApiSuccessResponse<T> = {
	success: true;
	metadata: ApiRequestMeta;
	data: T;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface WebImportDTO {
	workspace_id: string;
	file_path: string;
}

export interface LoginRequestDTO {
	email: string;
}

export interface RegisterDTO {
	email: string;
}

export interface UserInfo {
	email: string;
	isAdmin: boolean;
	isDemoUser: boolean;
	sessionStartUnix: number;
}
