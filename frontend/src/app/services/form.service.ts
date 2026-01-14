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
import type {
	DraftParentMetadata,
	ReqState,
	ReqTabId,
	RequestMethod,
	ResTabId,
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

	constructor() {
		//tab refresh notification
		this._tabSvc.refreshNotifier
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					console.log(`received signal to refresh self`);
					this.initializeReqForm(this._requestId);
				},
			});
	}

	//#region request-ops
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

	public setUrl(v: string) {
		this.urlSvc.setUrl(v);
		this._tabSvc.updateActiveTab("name", v);
	}

	public setMethod(v: RequestMethod) {
		this.urlSvc.setSelectedMethod(v);
		this._tabSvc.updateActiveTab("tag", v);
	}

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

	public async send() {
		if (!this.urlSvc.isValidUrl()) {
			console.log(`invalid URL`);
			return;
		}

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

			console.dir(payload);

			const res = await SendHttpReq(payload as models.GurlReq);

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
