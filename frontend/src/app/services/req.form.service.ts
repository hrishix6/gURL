import {
	computed,
	DestroyRef,
	Injectable,
	inject,
	signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CancelReq, SendHttpReq } from "@wailsjs/go/executor/Executor";
import type { models } from "@wailsjs/go/models";
import {
	FindDraftById,
	SaveDraftAsRequest,
	SaveFile,
} from "@wailsjs/go/storage/Storage";
import { nanoid } from "nanoid";

import {
	COOKIE_PLACEHOLDER,
	DEFAULT_REQ_TAB,
	DEFAULT_RES_TAB,
	HID_PLACEHOLDER,
	MULTIPART_ID_PLACEHOLDER,
	QID_PLACEHOLDER,
	REQ_DETAILS_TABS,
	RES_DETAILS_TABS,
	URLENCODED_ID_PLACEHOLDER,
} from "@/constants";
import { AppService, TabsService } from "@/services";
import {
	AppTabType,
	type DraftParentMetadata,
	type KeyValItem,
	type MultipartItem,
	type ReqBodyType,
	type ReqState,
	type ReqTabId,
	type RequestAuthType,
	type RequestMethod,
	type ResTabId,
} from "@/types";
import { AuthService } from "./http/auth.service";
import { BodyService } from "./http/body.service";
import { CookieService } from "./http/cookie.service";
import { HeadersService } from "./http/headers.service";
import { UrlService } from "./http/url.service";

@Injectable()
export class FormService {
	private _requestId: string = "";
	private destroyRef = inject(DestroyRef);

	private _parentMeta = signal<DraftParentMetadata>({
		parentCollectionId: "",
		parentRequestId: "",
		parentRequestName: "",
	});

	public draftParentData = computed(() => this._parentMeta());
	private _isInitialized = signal<boolean>(false);
	private _tabSvc = inject(TabsService);
	private _appSvc = inject(AppService);
	public auth = new AuthService(this.destroyRef);
	public headerSvc = new HeadersService(this.destroyRef);
	public cookieSvc = new CookieService(this.destroyRef);
	public bodySvc = new BodyService(this.destroyRef);
	public urlSvc = new UrlService(this.destroyRef);

	public saveDraftModalTitle = computed(() => {
		const { parentRequestId, parentRequestName } = this.draftParentData();

		if (!parentRequestId) {
			return "Save draft as request ?";
		}

		return `Save changes for request "${parentRequestName}" ?`;
	});

	public saveDraftModalMessage = computed(() => {
		const { parentRequestId } = this.draftParentData();

		if (!parentRequestId) {
			return "Your changes will be lost, save these changes to avoid losing work.";
		}

		return "Your changes to the request will be lost, save these changes to avoid losing work.";
	});

	constructor() {
		//tab refresh notification
		this._tabSvc.refreshNotifier
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (v) => {
					if (v === AppTabType.Req) {
						console.log(`received signal to refresh self`);
						this.initializeReqForm(this._requestId);
					}
				},
			});
		this._tabSvc.closeReqTabEvent$
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (tab) => {
					if (tab.entityId !== this._requestId) {
						return;
					}

					console.log(
						`received signal to handle tab close for ${tab.id} and draft ${this._requestId}`,
					);
					const { parentRequestId } = this.draftParentData();

					if (parentRequestId) {
						if (tab.isModified) {
							if (!this._appSvc.alwaysDiscardDrafts()) {
								console.log(
									`draft is linked to ${parentRequestId} and modified asking to save`,
								);
								this._tabSvc.setActiveTab(tab.id);
								this._isDraftSavePreferenceModalOpen.set(true);
								return;
							}
						}
						console.log(
							`draft is linked to ${parentRequestId} and not modified, closing tab`,
						);
						this._tabSvc.deleteTab(tab.id, AppTabType.Req);
					} else {
						if (tab.isModified) {
							if (!this._appSvc.alwaysDiscardDrafts()) {
								console.log(
									`draft is not linked to any request, asking to save as new request`,
								);
								this._tabSvc.setActiveTab(tab.id);
								this._isDraftSavePreferenceModalOpen.set(true);
								return;
							}
						}

						console.log(
							`draft is not linked to any request and user doesn't want to save drafts, closing tab`,
						);
						this._tabSvc.deleteTab(tab.id, AppTabType.Req);
					}
				},
			});
	}

	//#region request-ops
	private _isDraftSavePreferenceModalOpen = signal<boolean>(false);

	public isDraftSavePreferenceModalOpen = computed(() =>
		this._isDraftSavePreferenceModalOpen(),
	);

	public toggleDraftSavePreferenceModal() {
		this._isDraftSavePreferenceModalOpen.update((x) => !x);
	}

	private _saveRequestModalOpen = signal<boolean>(false);
	public isSaveRequestModalOpen = computed(() => this._saveRequestModalOpen());

	public toggleSaveRequestModal() {
		this._saveRequestModalOpen.update((x) => !x);
	}

	public async saveRequestToCollection(name: string, collectionId: string) {
		try {
			console.log(
				`trying to save draft: #${this._requestId} as request with name ${name} in collection #${collectionId}`,
			);

			const { parentRequestId } = this.draftParentData();

			let requestId = "";

			if (parentRequestId) {
				//save changes to existing request
				requestId = parentRequestId;
			} else {
				requestId = nanoid();
			}

			await SaveDraftAsRequest({
				draftId: this._requestId,
				collectionId: collectionId,
				name,
				requestId,
			});

			this._appSvc.refreshSavedRequests$.next();

			this._parentMeta.set({
				parentRequestId: requestId,
				parentCollectionId: collectionId,
				parentRequestName: name,
			});

			this._tabSvc.updateActiveTab("name", name);
			this._tabSvc.updateModifiedStatus(false);
			this._appSvc.refreshBreadcrumb$.next();
		} catch (error) {
			console.error(error);
		} finally {
			this.toggleSaveRequestModal();
		}
	}

	public async copyRequest() {
		const newDraft: models.RequestDraftDTO = {
			id: nanoid(),
			bodyType: this.bodySvc.bodyType().id,
			url: this.urlSvc.url(),
			method: this.urlSvc.method().id,
			headers: JSON.stringify(
				this.headerSvc.headers().filter((x) => x.id !== HID_PLACEHOLDER),
			),
			cookies: JSON.stringify(
				this.cookieSvc.cookies().filter((x) => x.id !== COOKIE_PLACEHOLDER),
			),
			urlencoded: JSON.stringify(
				this.bodySvc
					.urlEncodedParams()
					.filter((x) => x.id !== URLENCODED_ID_PLACEHOLDER),
			),
			multipart: JSON.stringify(
				this.bodySvc
					.multipartForm()
					.filter((x) => x.id !== MULTIPART_ID_PLACEHOLDER),
			),
			query: JSON.stringify(
				this.urlSvc.queryParams().filter((x) => x.id !== QID_PLACEHOLDER),
			),
			binary: this.bodySvc.binaryBody()
				? JSON.stringify(this.bodySvc.binaryBody())
				: "",
			text: this.bodySvc.textBody(),
			apiKeyAuth: JSON.stringify(this.auth.apiKey()),
			authType: this.auth.activeAuth().id,
			authEnabled: this.auth.authEnabled(),
			basicAuth: JSON.stringify(this.auth.basicAuth()),
			tokenAuth: JSON.stringify(this.auth.tokenAuth()),
			//clear parent info for copy
			parentCollectionId: "",
			parentRequestId: "",
			parentRequestName: "",
		};
		await this._tabSvc.createDuplicateTab(newDraft);
	}

	//#endregion request-ops

	//#region cookies
	private _cookiePreviewMode = signal<boolean>(true);

	public cookiesPreviewMode = computed(() => this._cookiePreviewMode());

	public toggleCookiePreviewMode() {
		this._cookiePreviewMode.update((x) => !x);
	}
	//#endregion cookies

	//#region tab-management
	private _activeRequestTab = signal<ReqTabId>(DEFAULT_REQ_TAB);
	private _activeResTab = signal<ResTabId>(DEFAULT_RES_TAB);
	public activeReqTab = computed(() => this._activeRequestTab());
	public activeResTab = computed(() => this._activeResTab());

	public setActiveReqTab(id: ReqTabId) {
		const tab = REQ_DETAILS_TABS.find((x) => x.id === id);
		if (tab) {
			this._activeRequestTab.set(id);
		}
	}
	public setActiveResTab(id: ResTabId) {
		const index = RES_DETAILS_TABS.findIndex((x) => x.id === id);
		if (index !== -1) {
			this._activeResTab.set(id);
		}
	}
	//#endregion tab-management

	//#region proxy-setters

	public setUrl(v: string) {
		this.urlSvc.setUrl(v);
		this._tabSvc.updateActiveTab("name", v);
	}

	public parseUrl() {
		this.urlSvc._parseUrl();
		if (this.urlSvc.url()) {
			this._tabSvc.updateModifiedStatus(true);
		}
	}

	public bulkUpdateQueryParams(items: KeyValItem[]) {
		this.urlSvc._bulkUpdateQueryParams(items);
		this._tabSvc.updateModifiedStatus(true);
	}

	public updateQueryParam(
		id: string,
		prop: Exclude<keyof KeyValItem, "id">,
		v: string,
	) {
		this.urlSvc._updateQueryParam(id, prop, v);
		this._tabSvc.updateModifiedStatus(true);
	}

	public deleteQueryParam(id: string) {
		this.urlSvc._deleteQueryParam(id);
		this._tabSvc.updateModifiedStatus(true);
	}

	public setMethod(v: RequestMethod) {
		this.urlSvc.setSelectedMethod(v);
		this._tabSvc.updateActiveTab("tag", v);
		this._tabSvc.updateModifiedStatus(true);
	}

	public toggleAuthEnabled() {
		this.auth._toggleAuthEnabled();
		this._tabSvc.updateModifiedStatus(true);
	}

	public setAuth(v: RequestAuthType) {
		this.auth._setAuth(v);
		this._tabSvc.updateModifiedStatus(true);
	}

	public updateApiKey(prop: keyof models.ApiKeyAuth, value: string) {
		this.auth._updateApiKey(prop, value);
		this._tabSvc.updateModifiedStatus(true);
	}

	public updateTokenAuth(prop: keyof models.TokenAuth, value: string) {
		this.auth._updateTokenAuth(prop, value);
		this._tabSvc.updateModifiedStatus(true);
	}

	public updateBasicAuth(prop: keyof models.BasicAuth, v: string) {
		this.auth._updateBasicAuth(prop, v);
		this._tabSvc.updateModifiedStatus(true);
	}

	public setBodyType(v: ReqBodyType) {
		this.bodySvc._setBodyType(v);
		this._tabSvc.updateModifiedStatus(true);
	}

	public updateMultiPartField(
		id: string,
		prop: Exclude<keyof MultipartItem, "id" | "val">,
		v: string,
	) {
		this.bodySvc._updateMultiPartField(id, prop, v);
		this._tabSvc.updateModifiedStatus(true);
	}
	public updateMultipartFieldValue(id: string, v: string | models.FileStats) {
		this.bodySvc._updateMultipartFieldValue(id, v);
		this._tabSvc.updateModifiedStatus(true);
	}

	public clearMultipartFileInput(id: string) {
		this.bodySvc._clearMultipartFileInput(id);
		this._tabSvc.updateModifiedStatus(true);
	}

	public deleteMultipartItem(id: string) {
		this.bodySvc._deleteMultipartItem(id);
		this._tabSvc.updateModifiedStatus(true);
	}

	public bulkUpdateUrlEncodedForm(items: KeyValItem[]) {
		this.bodySvc._bulkUpdateUrlEncodedForm(items);
		this._tabSvc.updateModifiedStatus(true);
	}

	public updateUrlEncodedField(
		id: string,
		prop: Exclude<keyof KeyValItem, "id">,
		v: string,
	) {
		this.bodySvc._updateUrlEncodedField(id, prop, v);
		this._tabSvc.updateModifiedStatus(true);
	}

	public deleteUrlEncodedField(id: string) {
		this.bodySvc._deleteUrlEncodedField(id);
		this._tabSvc.updateModifiedStatus(true);
	}

	public setBinaryBody(v: models.FileStats) {
		this.bodySvc._setBinaryBody(v);
		this._tabSvc.updateModifiedStatus(true);
	}

	public setTextBody(v: string) {
		this.bodySvc._setTextBody(v);
		this._tabSvc.updateModifiedStatus(true);
	}

	public clearBinaryBody() {
		this.bodySvc._clearBinaryBody();
		this._tabSvc.updateModifiedStatus(true);
	}

	public deleteCookie(id: string) {
		this.cookieSvc._deleteCookie(id);
		this._tabSvc.updateModifiedStatus(true);
	}

	public updateCookie(
		id: string,
		prop: Exclude<keyof KeyValItem, "id">,
		v: string,
	) {
		this.cookieSvc._updateCookie(id, prop, v);
		this._tabSvc.updateModifiedStatus(true);
	}

	public bulkUpdateCookieParams(items: KeyValItem[]) {
		this.cookieSvc._bulkUpdateCookieParams(items);
		this._tabSvc.updateModifiedStatus(true);
	}

	public deleteHeader(id: string) {
		this.headerSvc._deleteHeader(id);
		this._tabSvc.updateModifiedStatus(true);
	}

	public updateHeader(
		id: string,
		prop: Exclude<keyof KeyValItem, "id">,
		v: string,
	) {
		this.headerSvc._updateHeader(id, prop, v);
		this._tabSvc.updateModifiedStatus(true);
	}

	public bulkUpdateHeadersParams(items: KeyValItem[]) {
		this.headerSvc._bulkUpdateHeadersParams(items);
		this._tabSvc.updateModifiedStatus(true);
	}
	//#endregion proxy-setters

	//#region Request-Response

	private _res = signal<models.GurlRes | null>(null);

	public res = computed(() => this._res());

	private _headersPreviewMode = signal<boolean>(true);

	public headersPreviewMode = computed(() => this._headersPreviewMode());

	public toggleHeadersPreview() {
		this._headersPreviewMode.update((x) => !x);
	}

	public resHeadersRaw = computed(() => {
		return this._res()?.resHeaders.reduce((acc, curr) => {
			acc += `${curr.key}: ${curr.value}\n`;
			return acc;
		}, "");
	});

	public reqHeadersRaw = computed(() => {
		return this._res()?.reqHeaders.reduce((acc, curr) => {
			acc += `${curr.key}: ${curr.value}\n`;
			return acc;
		}, "");
	});

	private populateInitialState(data: models.RequestDraftDTO) {
		try {
			this.urlSvc.init(data);
			this.headerSvc.init(data);
			this.cookieSvc.init(data);
			this.bodySvc.init(data);
			this.auth.init(data);
		} catch (_error) {
			console.error(_error);
		}
	}

	public async initializeReqForm(id: string) {
		try {
			console.log(`Initializing draft ${id}`);
			const dbRequest = await FindDraftById(id);
			if (!dbRequest) {
				//TODO: Warn using Toast message and close tab
				console.warn(`Draft with id ${id} not found`);
				return;
			}
			this._requestId = dbRequest.id;
			this._parentMeta.set({
				parentCollectionId: dbRequest.parentCollectionId,
				parentRequestId: dbRequest.parentRequestId,
				parentRequestName: dbRequest.parentRequestName,
			});

			this.populateInitialState(dbRequest);
		} catch (error) {
			console.error(error);
		} finally {
			this._isInitialized.set(true);
		}
	}

	private _reqStatus = signal<ReqState>("idle");
	public reqState = computed(() => this._reqStatus());

	private _previewMode = signal<boolean>(false);
	public previewMode = computed(() => this._previewMode());

	public togglePreviewMode() {
		this._previewMode.update((x) => !x);
	}

	public clearResponse() {
		this._reqStatus.set("idle");
		this._res.set(null);
	}

	public interpolatedPayload(payload: models.GurlReq): models.GurlReq {
		const o: Partial<models.GurlReq> = {
			...payload,
			headers: payload.headers.map((h) => {
				return {
					...h,
					key: this._appSvc.interPolateEnvTokens(h.key),
					value: this._appSvc.interPolateEnvTokens(h.value),
				};
			}),
			query: payload.query.map((q) => {
				return {
					...q,
					key: this._appSvc.interPolateEnvTokens(q.key),
					value: this._appSvc.interPolateEnvTokens(q.value),
				};
			}),
			cookies: payload.cookies.map((c) => {
				return {
					...c,
					key: this._appSvc.interPolateEnvTokens(c.key),
					value: this._appSvc.interPolateEnvTokens(c.value),
				};
			}),
			urlencoded: payload.urlencoded.map((u) => {
				return {
					...u,
					key: this._appSvc.interPolateEnvTokens(u.key),
					value: this._appSvc.interPolateEnvTokens(u.value),
				};
			}),
			multipart: payload.multipart.map((m) => {
				return {
					...m,
					key: this._appSvc.interPolateEnvTokens(m.key),
					value: this._appSvc.interPolateEnvTokens(m.value),
				};
			}),
			url: this._appSvc.interPolateEnvTokens(payload.url),
		};

		const { apiKeyAuth, authEnabled, authType, basicAuth, tokenAuth } =
			payload.auth;

		const substitutedAuth: Partial<models.GurlAuth> = {
			authEnabled,
			authType,
			apiKeyAuth: {
				...apiKeyAuth,
				key: this._appSvc.interPolateEnvTokens(apiKeyAuth.key),
				value: this._appSvc.interPolateEnvTokens(apiKeyAuth.value),
			},
			basicAuth: {
				...basicAuth,
				username: this._appSvc.interPolateEnvTokens(basicAuth.username),
				password: this._appSvc.interPolateEnvTokens(basicAuth.password),
			},
			tokenAuth: {
				...tokenAuth,
				token: this._appSvc.interPolateEnvTokens(tokenAuth.token),
			},
		};

		o.auth = substitutedAuth as models.GurlAuth;
		return o as models.GurlReq;
	}

	public async send() {
		if (this.urlSvc.url() === "") {
			return;
		}

		try {
			this._reqStatus.set("progress");
			this._res.set(null);
			const payload: Partial<models.GurlReq> = {
				id: this._requestId,
				url: this.urlSvc.url(),
				method: this.urlSvc.method().id,
				query: this.urlSvc.requestQueryParams(),
				headers: this.headerSvc.requestHeaders(),
				cookies: this.cookieSvc.requestCookies(),
				bodyType: this.bodySvc.bodyType().id,
				binary: this.bodySvc.requestBinaryData(),
				multipart: this.bodySvc.requestMultipartData(),
				plaintext: this.bodySvc.textBody(),
				urlencoded: this.bodySvc.requestUrlEncodedData(),
				auth: this.auth.requestAuthData(),
			};

			const substitudedPayload = this.interpolatedPayload(
				payload as models.GurlReq,
			);

			console.dir(substitudedPayload);

			const res = await SendHttpReq(substitudedPayload);

			console.dir(res);

			this._res.set(res);

			if (res.body?.html5Element === "text") {
				this._previewMode.set(true);
			}

			this._reqStatus.set("success");

			this._appSvc.addHistoryItem({
				id: nanoid(),
				bodyType: this.bodySvc.bodyType().id,
				success: res.success,
				url: this.urlSvc.url(),
				method: this.urlSvc.method().id,
				headers: this.headerSvc
					.headers()
					.filter((x) => x.id !== HID_PLACEHOLDER),
				cookies: this.cookieSvc
					.cookies()
					.filter((x) => x.id !== COOKIE_PLACEHOLDER),
				urlEncodedBody: this.bodySvc
					.urlEncodedParams()
					.filter((x) => x.id !== URLENCODED_ID_PLACEHOLDER),
				multiPartBody: this.bodySvc
					.multipartForm()
					.filter((x) => x.id !== MULTIPART_ID_PLACEHOLDER),
				queryParams: this.urlSvc
					.queryParams()
					.filter((x) => x.id !== QID_PLACEHOLDER),
				binaryBody: this.bodySvc.binaryBody(),
				statusText: res.statusText,
				textBody: this.bodySvc.textBody(),
				executed: Date.now(),
				authEnabled: this.auth.authEnabled(),
				authType: this.auth.activeAuth().id,
				basicAuth: this.auth.basicAuth(),
				apiKeyAuth: this.auth.apiKey(),
				tokenAuth: this.auth.tokenAuth(),
			});
		} catch (error) {
			console.error(error);
			if (typeof error === "string" && error.includes("context canceled")) {
				this._reqStatus.set("aborted");
				return;
			}

			this._reqStatus.set("error");
		}
	}

	public async saveToFile() {
		try {
			const b = this._res()?.body;
			if (!b) {
				return;
			}
			await SaveFile(b.filepath);
		} catch (error) {
			console.error(error);
		}
	}

	public async cancel() {
		try {
			await CancelReq(this._requestId);
			this._reqStatus.set("aborted");
		} catch (error) {
			console.error(error);
		}
	}

	//#endregion Request-Response
}
