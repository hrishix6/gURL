import {
	computed,
	DestroyRef,
	Injectable,
	inject,
	signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { models } from "@wailsjs/go/models";
import { nanoid } from "nanoid";
import { extractTokens } from "@/common/utils/tokens";
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
import {
	AlertService,
	AppService,
	getFileRepository,
	getHttpExecutor,
	getReqRepository,
	TabsService,
} from "@/services";
import {
	AppTabType,
	type DraftParentMetadata,
	type InputToken,
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
	private _requestTabId: string = "";
	private _requestId: string = "";
	private _tabType = signal<AppTabType>(AppTabType.Req);
	private reqRepository = getReqRepository();
	private httpExecutor = getHttpExecutor();
	private fileRepo = getFileRepository();
	public tabType = computed(() => this._tabType());
	private destroyRef = inject(DestroyRef);

	private _parentMeta = signal<DraftParentMetadata>({
		parentCollectionId: "",
		parentRequestId: "",
		parentRequestName: "",
	});

	public draftParentData = computed(() => this._parentMeta());
	private _tabSvc = inject(TabsService);
	private _appSvc = inject(AppService);
	private _alertSvc = inject(AlertService);
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
						this.initializeReqForm(this._requestTabId, this._requestId);
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

					if (this._appSvc.collections().length === 0) {
						this._tabSvc.deleteTab(tab.id, AppTabType.Req);
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

			await this.reqRepository.saveDraftAsRequest({
				draftId: this._requestId,
				collectionId: collectionId,
				name,
				requestId,
				workspaceId: this._appSvc.activeWorkSpace().id,
			});

			this._alertSvc.addAlert(`Request "${name}" saved`, "success");

			await this._appSvc.initializeSavedRequests();

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
			this._alertSvc.addAlert(`Failed to save request`, "error");
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
			path: JSON.stringify(this.urlSvc.pathParams()),
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
		const modified = this.urlSvc.setUrl(v);
		this._tabSvc.updateActiveTab("name", v);
		if (modified) {
			this._tabSvc.updateModifiedStatus(true);
		}
	}

	public parseUrl() {
		const modified = this.urlSvc._parseUrl();
		if (modified) {
			this._tabSvc.updateModifiedStatus(true);
		}
	}

	public bulkUpdateQueryParams(items: models.GurlKeyValItem[]) {
		this.urlSvc._bulkUpdateQueryParams(items);
		this._tabSvc.updateModifiedStatus(true);
	}

	public updateQueryParam(
		id: string,
		prop: Exclude<keyof models.GurlKeyValItem, "id">,
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

	public bulkUpdateUrlEncodedForm(items: models.GurlKeyValItem[]) {
		this.bodySvc._bulkUpdateUrlEncodedForm(items);
		this._tabSvc.updateModifiedStatus(true);
	}

	public updateUrlEncodedField(
		id: string,
		prop: Exclude<keyof models.GurlKeyValItem, "id">,
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
		prop: Exclude<keyof models.GurlKeyValItem, "id">,
		v: string,
	) {
		this.cookieSvc._updateCookie(id, prop, v);
		this._tabSvc.updateModifiedStatus(true);
	}

	public bulkUpdateCookieParams(items: models.GurlKeyValItem[]) {
		this.cookieSvc._bulkUpdateCookieParams(items);
		this._tabSvc.updateModifiedStatus(true);
	}

	public deleteHeader(id: string) {
		this.headerSvc._deleteHeader(id);
		this._tabSvc.updateModifiedStatus(true);
	}

	public updateHeader(
		id: string,
		prop: Exclude<keyof models.GurlKeyValItem, "id">,
		v: string,
	) {
		this.headerSvc._updateHeader(id, prop, v);
		this._tabSvc.updateModifiedStatus(true);
	}

	public bulkUpdateHeadersParams(items: models.GurlKeyValItem[]) {
		this.headerSvc._bulkUpdateHeadersParams(items);
		this._tabSvc.updateModifiedStatus(true);
	}
	//#endregion proxy-setters

	//#region Request-Response
	public extractTokens(v: string): InputToken[] {
		const tokens = extractTokens(v);
		for (const token of tokens) {
			if (token.type === "env") {
				[token.valid, token.interpolated] =
					this._appSvc.validateInterpolatedToken(token);
			}

			if (token.type === "path") {
				[token.valid, token.interpolated] =
					this.urlSvc.validateInterpolatedPathToken(token);
			}
		}

		return tokens;
	}

	private _res = signal<models.GurlRes | null>(null);

	public res = computed(() => this._res());

	private _headersPreviewMode = signal<boolean>(true);

	public headersPreviewMode = computed(() => this._headersPreviewMode());

	public toggleHeadersPreview() {
		this._headersPreviewMode.update((x) => !x);
	}

	public resHeadersRaw = computed(() => {
		return this._res()?.resHeaders.reduce((acc, curr) => {
			acc += `${curr.key}: ${curr.val}\n`;
			return acc;
		}, "");
	});

	public reqHeadersRaw = computed(() => {
		return this._res()?.reqHeaders.reduce((acc, curr) => {
			acc += `${curr.key}: ${curr.val}\n`;
			return acc;
		}, "");
	});

	private populateInitialState(data: models.RequestDraftDTO) {
		this.urlSvc.init(data);
		this.headerSvc.init(data);
		this.cookieSvc.init(data);
		this.bodySvc.init(data);
		this.auth.init(data);
	}

	private async populateRequestExampleState(data: models.ReqExampleDTO) {
		this.urlSvc.initExample(data);
		this.headerSvc.initExample(data);
		this.cookieSvc.initExample(data);
		this.bodySvc.initExample(data);
		this.auth.initExample(data);

		const renderMeta = data.responseBody
			? (JSON.parse(data.responseBody) as models.SavedResponseRenderMeta)
			: null;

		if (renderMeta) {
			const { canRender, html5Element, extension, filepath } = renderMeta;

			const res = {
				id: data.id,
				dlMs: data.responseDlMs,
				limitExceeded: data.limitExceeded,
				ttfbMs: data.responseTffbMs,
				uploadSize: data.uploadSize,
				reportedSize: data.responseSize,
				sizeNotReported: false,
				status: data.responseStatus,
				statusText: data.responseStatusText,
				size: data.responseSize,
				time: data.responseTimeMS,
				success: data.responseSuccess,
				cookies: data.responseCookies ? JSON.parse(data.responseCookies) : [],
				resHeaders: data.responseHeaders
					? JSON.parse(data.responseHeaders)
					: [],
				reqHeaders: data.sentHeaders ? JSON.parse(data.sentHeaders) : [],
				body: {
					canRender: canRender,
					html5Element: html5Element,
					extension: extension,
					filepath: filepath,
					detectedMimeType: "",
					reportedMimeType: "",
					src: await this.httpExecutor.getSavedResponsesSrc(filepath),
				},
			} as models.GurlRes;

			console.dir(res);
			this._res.set(res);
		}
		this._reqStatus.set("success");
	}

	public async initializeReqForm(
		tabId: string,
		id: string,
		reqTabType: AppTabType = AppTabType.Req,
	) {
		try {
			this._tabType.set(reqTabType);
			this._requestTabId = tabId;
			if (reqTabType === AppTabType.ReqExample) {
				const dbExample = await this.reqRepository.getReqExampleById(id);
				if (!dbExample) {
					throw new Error(`Example with id ${id} not found in db`);
				}
				this._requestId = dbExample.id;
				this._parentMeta.set({
					parentCollectionId: dbExample.collectionId,
					parentRequestId: dbExample.requestId,
					parentRequestName: dbExample.name,
				});
				await this.populateRequestExampleState(dbExample);
			} else {
				const dbRequest = await this.reqRepository.findDraftById(id);
				if (!dbRequest) {
					throw new Error(`Draft with id ${id} not found in db`);
				}
				this._requestId = dbRequest.id;
				this._parentMeta.set({
					parentCollectionId: dbRequest.parentCollectionId,
					parentRequestId: dbRequest.parentRequestId,
					parentRequestName: dbRequest.parentRequestName,
				});

				this.populateInitialState(dbRequest);
			}
		} catch (error) {
			console.error(error);
			this._alertSvc.addAlert(
				`Failed to load request ${this._tabType() === AppTabType.ReqExample ? "example" : ""} tab`,
				"error",
			);
			this._tabSvc.deleteTab(this._requestTabId, reqTabType);
		}
	}

	private _reqStatus = signal<ReqState>("idle");
	public reqState = computed(() => this._reqStatus());

	private _previewMode = signal<boolean>(false);
	public previewMode = computed(() => this._previewMode());

	public clearResponse() {
		this._reqStatus.set("idle");
		this._res.set(null);
	}

	public interPolateTokens(v: string): string {
		let o = "";

		const tokens = this.extractTokens(v);

		if (!tokens.length) {
			return o;
		}

		for (const token of tokens) {
			if (token.type === "env") {
				o += token.valid ? token.interpolated : "";
			}

			if (token.type === "text") {
				o += token.value;
			}

			if (token.type === "path") {
				o += token.valid ? token.interpolated : "";
			}
		}

		return o;
	}

	public interpolatedPayload(payload: models.GurlReq): models.GurlReq {
		const o: Partial<models.GurlReq> = {
			...payload,
			headers: payload.headers.map((h) => {
				return {
					...h,
					key: this.interPolateTokens(h.key),
					val: this.interPolateTokens(h.val),
				};
			}),
			query: payload.query.map((q) => {
				return {
					...q,
					key: this.interPolateTokens(q.key),
					val: this.interPolateTokens(q.val),
				};
			}),
			cookies: payload.cookies.map((c) => {
				return {
					...c,
					key: this.interPolateTokens(c.key),
					val: this.interPolateTokens(c.val),
				};
			}),
			urlencoded: payload.urlencoded.map((u) => {
				return {
					...u,
					key: this.interPolateTokens(u.key),
					val: this.interPolateTokens(u.val),
				};
			}),
			multipart: payload.multipart.map((m) => {
				return {
					...m,
					key: this.interPolateTokens(m.key),
					value: this.interPolateTokens(m.value),
				};
			}),
			url: this.interPolateTokens(this.interPolateTokens(payload.url)), //twice first pass for interpolating path params, 2nd pass for interpolating env (this is in case user has set path param value to {{var}})
		};

		const { apiKeyAuth, authEnabled, authType, basicAuth, tokenAuth } =
			payload.auth;

		const substitutedAuth: Partial<models.GurlAuth> = {
			authEnabled,
			authType,
			apiKeyAuth: {
				...apiKeyAuth,
				key: this.interPolateTokens(apiKeyAuth.key),
				value: this.interPolateTokens(apiKeyAuth.value),
			},
			basicAuth: {
				...basicAuth,
				username: this.interPolateTokens(basicAuth.username),
				password: this.interPolateTokens(basicAuth.password),
			},
			tokenAuth: {
				...tokenAuth,
				token: this.interPolateTokens(tokenAuth.token),
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

			const res = await this.httpExecutor.sendHttpReq(substitudedPayload);

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
				headers: this.headerSvc.requestHeaders(),
				cookies: this.cookieSvc.requestCookies(),
				urlEncodedBody: this.bodySvc.requestUrlEncodedData(),
				multiPartBody: this.bodySvc.multiPartItemsForHistory(),
				queryParams: this.urlSvc.requestQueryParams(),
				path: this.urlSvc.pathParams(),
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
			await this.fileRepo.saveFile(b.filepath);
			this._alertSvc.addAlert(`File saved`, "success");
		} catch (error) {
			console.error(error);
			this._alertSvc.addAlert(`Failed to save file`, "error");
		}
	}

	public async cancel() {
		try {
			await this.httpExecutor.cancelReq(this._requestId);
			this._reqStatus.set("aborted");
		} catch (error) {
			console.error(error);
			this._alertSvc.addAlert(`Failed to cancel request`, "error");
		}
	}

	private _isSaveExampleModalOpen = signal<boolean>(false);
	private _saveExampleInProgress = signal<boolean>(false);
	public saveExampleInProgress = computed(() => this._saveExampleInProgress());

	public isSaveExampleModalOpen = computed(() =>
		this._isSaveExampleModalOpen(),
	);

	handleOpenSaveExampleModal() {
		this._isSaveExampleModalOpen.set(true);
	}

	handleCloseSaveExampleModal() {
		this._isSaveExampleModalOpen.set(false);
	}

	async saveResponseExample(name: string) {
		try {
			this._saveExampleInProgress.set(true);
			console.log(`saving request example with name ${name}`);
			const { parentRequestId, parentCollectionId } = this.draftParentData();

			if (!parentRequestId || !parentCollectionId) {
				console.error(
					`Cannot save request example as parent request or collection id is missing`,
				);
				return;
			}

			const res = this.res();

			if (!res) {
				return;
			}

			console.dir(res);

			const {
				status,
				statusText,
				success,
				time,
				uploadSize,
				cookies,
				reqHeaders,
				resHeaders,
				body,
				dlMs,
				size,
				ttfbMs,
				limitExceeded,
			} = res;

			const dto: models.ReqExampleDTO = {
				id: nanoid(),
				url: this.interPolateTokens(this.interPolateTokens(this.urlSvc.url())),
				path: "",
				query: JSON.stringify(
					this.urlSvc.queryParamsForExample().map((q) => {
						return {
							...q,
							key: this.interPolateTokens(q.key),
							val: this.interPolateTokens(q.val),
						};
					}),
				),
				headers: JSON.stringify(
					this.headerSvc.headersForExample().map((h) => {
						return {
							...h,
							key: this.interPolateTokens(h.key),
							val: this.interPolateTokens(h.val),
						};
					}),
				),
				cookies: JSON.stringify(
					this.cookieSvc.cookiesForExample().map((c) => {
						return {
							...c,
							key: this.interPolateTokens(c.key),
							val: this.interPolateTokens(c.val),
						};
					}),
				),

				bodyType: this.bodySvc.bodyType().id,
				uploadSize,
				urlencoded: JSON.stringify(
					this.bodySvc.urlEncodedParamsForExample().map((u) => {
						return {
							...u,
							key: this.interPolateTokens(u.key),
							val: this.interPolateTokens(u.val),
						};
					}),
				),

				multipart: JSON.stringify(
					this.bodySvc.multipartFormForExample().map((m) => {
						return {
							...m,
							key: this.interPolateTokens(m.key),
							val:
								typeof m.val === "string"
									? this.interPolateTokens(m.val)
									: m.val,
						};
					}),
				),

				binary: this.bodySvc.binaryBody()
					? JSON.stringify(this.bodySvc.binaryBody())
					: "",

				text: this.bodySvc.textBody(),
				authEnabled: this.auth.authEnabled(),
				authType: this.auth.activeAuth().id,
				apiKeyAuth: JSON.stringify({
					...this.auth.apiKey(),
					key: this.interPolateTokens(this.auth.apiKey().key),
					value: this.interPolateTokens(this.auth.apiKey().value),
				}),
				basicAuth: JSON.stringify({
					...this.auth.basicAuth(),
					username: this.interPolateTokens(this.auth.basicAuth().username),
					password: this.interPolateTokens(this.auth.basicAuth().password),
				}),
				tokenAuth: JSON.stringify({
					...this.auth.tokenAuth(),
					token: this.interPolateTokens(this.auth.tokenAuth().token),
				}),
				method: this.urlSvc.method().id,
				name,
				requestId: parentRequestId,
				collectionId: parentCollectionId,
				workspaceId: this._appSvc.activeWorkSpace().id,
				responseStatus: status,
				responseStatusText: statusText,
				responseSuccess: success,
				responseTimeMS: time,
				responseDlMs: dlMs,
				responseSize: size,
				responseTffbMs: ttfbMs,
				limitExceeded: limitExceeded,
				responseCookies: cookies?.length ? JSON.stringify(cookies) : "[]",
				sentHeaders: reqHeaders?.length ? JSON.stringify(reqHeaders) : "[]",
				responseHeaders: resHeaders?.length ? JSON.stringify(resHeaders) : "[]",
				responseBody: "",
			};

			console.dir(dto);
			const meta: models.SavedResponseRenderMeta = {
				canRender: body?.canRender || false,
				html5Element: body?.html5Element || "",
				filepath: body?.filepath || "",
				extension: body?.extension || "",
				src: "",
			};
			console.dir(meta);
			await this.reqRepository.addReqExample(dto, meta);

			this._alertSvc.addAlert(`Example saved`, "success");
			this._appSvc.refreshSavedExamples$.next();
		} catch (error) {
			console.error(error);
			this._alertSvc.addAlert(`Failed to save example`, "error");
		} finally {
			this._saveExampleInProgress.set(false);
			this.handleCloseSaveExampleModal();
		}
	}
	//#endregion Request-Response
}
