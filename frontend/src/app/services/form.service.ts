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
	UpdateDraftBinaryBody,
	UpdateDraftBodyType,
	UpdateDraftCookies,
	UpdateDraftHeaders,
	UpdateDraftMethod,
	UpdateDraftMultipartForm,
	UpdateDraftQuery,
	UpdateDraftTextBody,
	UpdateDraftUrl,
	UpdateDraftUrlEncodedForm,
} from "@wailsjs/go/storage/Storage";
import { nanoid } from "nanoid";
import { debounceTime, Subject } from "rxjs";

import {
	COOKIE_PLACEHOLDER,
	DEFAULT_REQ_TAB,
	DEFAULT_RES_TAB,
	HID_PLACEHOLDER,
	MULTIPART_ID_PLACEHOLDER,
	QID_PLACEHOLDER,
	REQ_BODY_TYPES,
	REQ_DETAILS_TABS,
	REQ_METHODS,
	RES_DETAILS_TABS,
	URLENCODED_ID_PLACEHOLDER,
} from "@/constants";
import { AppService, TabsService } from "@/services";
import type {
	DraftParentMetadata,
	DropDownItem,
	KeyValItem,
	MultipartItem,
	ReqBodyType,
	ReqCookies,
	ReqState,
	ReqTabId,
	RequestHeaders,
	RequestMethod,
	RequestQuery,
	ResTabId,
} from "@/types";

@Injectable()
export class FormService {
	private _requestId: string = "";

	private _parentMeta = signal<DraftParentMetadata>({
		parentCollectionId: "",
		parentRequestId: "",
		parentRequestName: "",
	});

	public draftParentData = computed(() => this._parentMeta());
	private destroyRef = inject(DestroyRef);
	private _isInitialized = signal<boolean>(false);
	private _tabSvc = inject(TabsService);
	private _appSvc = inject(AppService);
	private headerChange$ = new Subject<RequestHeaders>();
	private methodChange$ = new Subject<RequestMethod>();
	private urlChange$ = new Subject<string>();
	private queryChange$ = new Subject<KeyValItem[]>();
	private bodyTypeChange$ = new Subject<ReqBodyType>();
	private multipartChange$ = new Subject<MultipartItem[]>();
	private urlEncodedChange$ = new Subject<KeyValItem[]>();
	private binaryBChange$ = new Subject<models.FileStats | null>();
	private textBChange$ = new Subject<string>();

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

		//body type
		this.bodyTypeChange$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: (v) => {
				UpdateDraftBodyType({
					requestId: this._requestId,
					bodyType: v,
				}).then(() => {
					console.log(`[${this._requestId}] body type set to ${v} in SQlite`);
				});
			},
		});

		//method
		this.methodChange$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: (v) => {
				UpdateDraftMethod({
					requestId: this._requestId,
					method: v,
				}).then(() => {
					console.log(`[${this._requestId}] method set to ${v} in SQlite`);
				});
			},
		});

		//url
		this.urlChange$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					UpdateDraftUrl({
						requestId: this._requestId,
						url: v,
					}).then(() => {
						console.log(`[${this._requestId}] url set to ${v} in SQlite`);
					});
				},
			});

		//headers
		this.headerChange$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					const payload = v.filter((x) => x.id !== HID_PLACEHOLDER);
					UpdateDraftHeaders({
						requestId: this._requestId,
						headersJson: JSON.stringify(payload),
					}).then(() => {
						console.log(`[${this._requestId}] headers updated in SQlite`);
					});
				},
			});

		this.cookieChange$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					const payload = v.filter((x) => x.id !== COOKIE_PLACEHOLDER);
					UpdateDraftCookies({
						requestId: this._requestId,
						cookiesJSON: JSON.stringify(payload),
					}).then(() => {
						console.log(`[${this._requestId}] cookies updated in SQlite`);
					});
				},
			});

		//query params
		this.queryChange$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					const payload = v.filter((x) => x.id !== QID_PLACEHOLDER);
					UpdateDraftQuery({
						requestId: this._requestId,
						queryJson: JSON.stringify(payload),
					}).then(() => {
						console.log(`[${this._requestId}] query updated in SQlite`);
					});
				},
			});

		//url encoded form
		this.urlEncodedChange$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					const payload = v.filter((x) => x.id !== URLENCODED_ID_PLACEHOLDER);
					UpdateDraftUrlEncodedForm({
						requestId: this._requestId,
						urlencodedJson: JSON.stringify(payload),
					}).then(() => {
						console.log(
							`[${this._requestId}] url encoded form updated in SQlite`,
						);
					});
				},
			});

		//multipart form
		this.multipartChange$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					const payload = v.filter((x) => x.id !== MULTIPART_ID_PLACEHOLDER);
					UpdateDraftMultipartForm({
						requestId: this._requestId,
						multipartJson: JSON.stringify(payload),
					}).then(() => {
						console.log(
							`[${this._requestId}] multipart form updated in SQlite`,
						);
					});
				},
			});

		//text body
		this.textBChange$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					UpdateDraftTextBody({
						requestId: this._requestId,
						textBody: v,
					}).then(() => {
						console.log(`[${this._requestId}] text body updated in SQlite`);
					});
				},
			});

		//binary body
		this.binaryBChange$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: (v) => {
				UpdateDraftBinaryBody({
					requestId: this._requestId,
					binaryJson: v ? JSON.stringify(v) : "",
				}).then(() => {
					console.log(`[${this._requestId}] binary body updated in SQlite`);
				});
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
			bodyType: this._bodyType().id,
			url: this._url(),
			method: this._method().id,
			headers: JSON.stringify(
				this._headers().filter((x) => x.id !== HID_PLACEHOLDER),
			),
			cookies: JSON.stringify(
				this._cookies().filter((x) => x.id !== COOKIE_PLACEHOLDER),
			),
			urlencoded: JSON.stringify(
				this._urlEncodedParams().filter(
					(x) => x.id !== URLENCODED_ID_PLACEHOLDER,
				),
			),
			multipart: JSON.stringify(
				this._multiPartForm().filter((x) => x.id !== MULTIPART_ID_PLACEHOLDER),
			),
			query: JSON.stringify(
				this._queryParams().filter((x) => x.id !== QID_PLACEHOLDER),
			),
			binary: this._binaryBody() ? JSON.stringify(this._binaryBody()) : "",
			text: this._textBody(),
			parentCollectionId: "",
			parentRequestId: "",
			parentRequestName: "",
		};
		await this._tabSvc.createDuplicateTab(newDraft);
	}

	//#endregion request-ops

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

	//#region cookies
	private cookieChange$ = new Subject<KeyValItem[]>();
	private _cookies = signal<ReqCookies>([
		{
			id: COOKIE_PLACEHOLDER,
			key: "",
			val: "",
			enabled: "on",
		},
	]);

	private _bulkEditModeCookies = signal<boolean>(false);

	public bulkEditModeCookies = computed(() => this._bulkEditModeCookies());

	public toggleEditModeCookies() {
		this._bulkEditModeCookies.update((x) => !x);
	}

	private _bulkCookiesText = signal<string>("");

	public setBulkCookiesText(s: string) {
		this._bulkCookiesText.set(s);
	}

	public bulkCookiesText = computed(() => {
		return this._cookies().reduce((prev, curr) => {
			if (curr.id !== COOKIE_PLACEHOLDER) {
				prev += `${curr.key}=${curr.val};`;
			}
			return prev;
		}, "");
	});

	public bulkUpdateCookieParams(items: KeyValItem[]) {
		const newParams = [
			...items,
			{
				id: COOKIE_PLACEHOLDER,
				key: "",
				val: "",
				enabled: "on",
			},
		];
		this._cookies.set(newParams);
		this.cookieChange$.next(newParams);
	}

	public cookies = computed(() => this._cookies());
	public cookiesCount = computed(() => this._cookies().length);

	public addCookie() {
		this._cookies.update((prev) => {
			const placeholderItemIndex = prev.findIndex(
				(x) => x.id === COOKIE_PLACEHOLDER,
			);

			if (placeholderItemIndex >= 0) {
				return prev;
			}

			return [
				...prev,
				{
					id: COOKIE_PLACEHOLDER,
					key: "",
					val: "",
					enabled: "on",
				},
			];
		});
	}

	public updateCookie(
		id: string,
		prop: Exclude<keyof KeyValItem, "id">,
		v: string,
	) {
		this._cookies.update((prev) => {
			const index = prev.findIndex((x) => x.id === id);
			if (index === -1) {
				return prev;
			}

			const copy = [...prev];
			copy[index][prop] = v;

			if (id === COOKIE_PLACEHOLDER) {
				copy[index].id = nanoid();
			}

			this.cookieChange$.next(copy);
			return copy;
		});
	}

	public deleteCookie(id: string) {
		this._cookies.update((prev) => {
			const copy = prev.filter((x) => x.id !== id);
			this.cookieChange$.next(copy);
			return copy;
		});
	}

	private _cookiePreviewMode = signal<boolean>(true);

	public cookiesPreviewMode = computed(() => this._cookiePreviewMode());

	public toggleCookiePreviewMode() {
		this._cookiePreviewMode.update((x) => !x);
	}

	//#endregion cookies

	//#region Headers
	private _headers = signal<RequestHeaders>([
		{
			id: HID_PLACEHOLDER,
			key: "",
			val: "",
			enabled: "on",
		},
	]);

	private _bulkEditModeHeaders = signal<boolean>(false);

	public bulkEditModeHeaders = computed(() => this._bulkEditModeHeaders());

	public toggleEditModeHeaders() {
		this._bulkEditModeHeaders.update((x) => !x);
	}

	private _bulkHeadersText = signal<string>("");

	public setBulkHeadersText(s: string) {
		this._bulkHeadersText.set(s);
	}

	public bulkHeadersText = computed(() => {
		return this._headers().reduce((prev, curr) => {
			if (curr.id !== HID_PLACEHOLDER) {
				prev += `${curr.enabled === "on" ? "" : "#"}${curr.key}:${curr.val}\n`;
			}
			return prev;
		}, "");
	});

	public bulkUpdateHeadersParams(items: KeyValItem[]) {
		const newParams = [
			...items,
			{
				id: HID_PLACEHOLDER,
				key: "",
				val: "",
				enabled: "on",
			},
		];
		this._headers.set(newParams);
		this.headerChange$.next(newParams);
	}

	public headers = computed(() => this._headers());
	public headerCount = computed(() => this._headers.length);

	public addHeader() {
		this._headers.update((prev) => {
			const placeholderItemIndex = prev.findIndex(
				(x) => x.id === HID_PLACEHOLDER,
			);

			if (placeholderItemIndex >= 0) {
				return prev;
			}

			return [
				...prev,
				{
					id: HID_PLACEHOLDER,
					key: "",
					val: "",
					enabled: "on",
				},
			];
		});
	}

	public updateHeader(
		id: string,
		prop: Exclude<keyof KeyValItem, "id">,
		v: string,
	) {
		this._headers.update((prev) => {
			const index = prev.findIndex((x) => x.id === id);
			if (index === -1) {
				return prev;
			}

			const copy = [...prev];
			copy[index][prop] = v;

			if (id === HID_PLACEHOLDER) {
				copy[index].id = nanoid();
			}

			this.headerChange$.next(copy);
			return copy;
		});
	}

	public deleteHeader(id: string) {
		this._headers.update((prev) => {
			const copy = prev.filter((x) => x.id !== id);
			this.headerChange$.next(copy);
			return copy;
		});
	}
	//#endregion Headers

	//#region Query

	private _queryParams = signal<RequestQuery>([
		{
			id: QID_PLACEHOLDER,
			key: "",
			val: "",
			enabled: "on",
		},
	]);

	private _bulkEditModeQuery = signal<boolean>(false);

	public bulkEditModeQuery = computed(() => this._bulkEditModeQuery());

	public toggleEditModeQuery() {
		this._bulkEditModeQuery.update((x) => !x);
	}

	private _bulkQueryText = signal<string>("");

	public setBulkText(s: string) {
		this._bulkQueryText.set(s);
	}

	public bulkQueryParamText = computed(() => {
		return this._queryParams().reduce((prev, curr) => {
			if (curr.id !== QID_PLACEHOLDER) {
				prev += `${curr.enabled === "on" ? "" : "#"}${curr.key}:${curr.val}\n`;
			}
			return prev;
		}, "");
	});

	public queryParams = computed(() => this._queryParams());
	public queryParamsCount = computed(() => this._queryParams.length);
	public addQueryParam() {
		this._queryParams.update((prev) => {
			const placeholderItemIndex = prev.findIndex(
				(x) => x.id === QID_PLACEHOLDER,
			);

			if (placeholderItemIndex >= 0) {
				return prev;
			}

			return [
				...prev,
				{
					id: QID_PLACEHOLDER,
					key: "",
					val: "",
					enabled: "on",
				},
			];
		});
	}

	public bulkUpdateQueryParams(items: KeyValItem[]) {
		const newParams = [
			...items,
			{
				id: QID_PLACEHOLDER,
				key: "",
				val: "",
				enabled: "on",
			},
		];
		this._queryParams.set(newParams);
		this.queryChange$.next(newParams);
	}

	public updateQueryParam(
		id: string,
		prop: Exclude<keyof KeyValItem, "id">,
		v: string,
	) {
		this._queryParams.update((prev) => {
			const index = prev.findIndex((x) => x.id === id);
			if (index === -1) {
				return prev;
			}

			const copy = [...prev];
			copy[index][prop] = v;

			if (id === QID_PLACEHOLDER) {
				copy[index].id = nanoid();
			}

			this.queryChange$.next(copy);
			return copy;
		});
	}

	public deleteQueryParam(id: string) {
		this._queryParams.update((prev) => {
			const copy = prev.filter((x) => x.id !== id);
			this.queryChange$.next(copy);
			return copy;
		});
	}
	//#endregion Query

	//#region Url
	private _url = signal<string>("");
	public url = computed(() => this._url());
	private _isUrlValid = signal<boolean>(true);
	public isValidUrl = computed(() => this._isUrlValid());

	public setUrl(v: string) {
		this._isUrlValid.set(true);
		this._url.set(v);
		this.urlChange$.next(v);
		this._tabSvc.updateActiveTab("name", v);
	}

	public parseUrl() {
		try {
			const parsed = new URL(this._url());

			const baseUrl = `${parsed.origin}${parsed.pathname}`;
			const searchParams = parsed.searchParams;

			if (searchParams.size) {
				this.appendQueryParams(searchParams);
			}

			this.setUrl(baseUrl);
		} catch (_error) {
			this._isUrlValid.set(false);
		}
	}

	private appendQueryParams(params: URLSearchParams) {
		this._queryParams.update((_) => {
			const newParams: KeyValItem[] = [];
			for (const [k, v] of params.entries()) {
				const newId = nanoid();
				newParams.push({
					id: newId,
					key: k,
					val: v,
					enabled: "on",
				});
			}

			this.queryChange$.next(newParams);

			return [
				...newParams,
				{
					id: QID_PLACEHOLDER,
					key: "",
					val: "",
					enabled: "on",
				},
			];
		});
	}
	//#endregion Url

	//#region Method
	private _method = signal<DropDownItem<RequestMethod>>(REQ_METHODS[0]);
	public method = computed(() => this._method());

	public setSelectedMethod(method: RequestMethod) {
		const itemIndex = REQ_METHODS.findIndex((x) => x.id === method);
		if (itemIndex > -1) {
			const selectedMethod = REQ_METHODS[itemIndex];
			this._tabSvc.updateActiveTab("tag", selectedMethod.id);
			this._method.set(selectedMethod);
			this.methodChange$.next(method);
		}
	}
	//#endregion Method

	//#region Body
	private _bodyType = signal<DropDownItem<ReqBodyType>>(REQ_BODY_TYPES[0]);
	public bodyType = computed(() => this._bodyType());
	public setBodyType(v: ReqBodyType) {
		const itemIndex = REQ_BODY_TYPES.findIndex((x) => x.id === v);
		if (itemIndex > -1) {
			this._bodyType.set(REQ_BODY_TYPES[itemIndex]);
			this.bodyTypeChange$.next(v);
		}
	}

	//#region Multipart
	private _multiPartForm = signal<MultipartItem[]>([
		{
			id: MULTIPART_ID_PLACEHOLDER,
			key: "",
			val: "",
			enabled: "on",
		},
	]);
	public multipartForm = computed(() => this._multiPartForm());

	public addMultiPartField() {
		this._multiPartForm.update((prev) => {
			const placeholderItemIndex = prev.findIndex(
				(x) => x.id === MULTIPART_ID_PLACEHOLDER,
			);

			if (placeholderItemIndex >= 0) {
				return prev;
			}

			return [
				...prev,
				{
					id: MULTIPART_ID_PLACEHOLDER,
					key: "",
					val: "",
					enabled: "on",
				},
			];
		});
	}

	public updateMultiPartField(
		id: string,
		prop: Exclude<keyof MultipartItem, "id" | "val">,
		v: string,
	) {
		this._multiPartForm.update((prev) => {
			const index = prev.findIndex((x) => x.id === id);
			if (index === -1) {
				return prev;
			}

			const copy = [...prev];
			copy[index][prop] = v;

			if (id === MULTIPART_ID_PLACEHOLDER) {
				copy[index].id = nanoid();
			}

			this.multipartChange$.next(copy);
			return copy;
		});
	}

	public clearMultipartFileInput(id: string) {
		this._multiPartForm.update((prev) => {
			const index = prev.findIndex((x) => x.id === id);
			if (index === -1) {
				return prev;
			}

			const copy = [...prev];
			copy[index].val = "";

			this.multipartChange$.next(copy);
			return copy;
		});
	}

	public updateMultipartFieldValue(id: string, v: string | models.FileStats) {
		this._multiPartForm.update((prev) => {
			const index = prev.findIndex((x) => x.id === id);
			if (index === -1) {
				return prev;
			}

			const copy = [...prev];
			copy[index].val = v;

			if (id === MULTIPART_ID_PLACEHOLDER) {
				copy[index].id = nanoid();
			}

			this.multipartChange$.next(copy);
			return copy;
		});
	}

	public deleteMultipartItem(id: string) {
		this._multiPartForm.update((prev) => {
			const copy = prev.filter((x) => x.id !== id);
			this.multipartChange$.next(copy);
			return copy;
		});
	}

	//#endregion Multipart

	//#region UrlEncoded

	private _bulkEditModeUrlEncodedForm = signal<boolean>(false);

	public bulkEditModeUrlEncodedForm = computed(() =>
		this._bulkEditModeUrlEncodedForm(),
	);

	public toggleEditModeUrlEncodedForm() {
		this._bulkEditModeUrlEncodedForm.update((x) => !x);
	}

	private _bulkUrlEncodedFormText = signal<string>("");

	public setBulkUrlEncodedFormText(s: string) {
		this._bulkUrlEncodedFormText.set(s);
	}

	public bulkUrlEncodedFormText = computed(() => {
		return this._urlEncodedParams().reduce((prev, curr) => {
			if (curr.id !== URLENCODED_ID_PLACEHOLDER) {
				prev += `${curr.enabled === "on" ? "" : "#"}${curr.key}:${curr.val}\n`;
			}
			return prev;
		}, "");
	});

	public bulkUpdateUrlEncodedForm(items: KeyValItem[]) {
		const newParams = [
			...items,
			{
				id: URLENCODED_ID_PLACEHOLDER,
				key: "",
				val: "",
				enabled: "on",
			},
		];
		this._urlEncodedParams.set(newParams);
		this.urlEncodedChange$.next(newParams);
	}

	private _urlEncodedParams = signal<KeyValItem[]>([
		{
			id: URLENCODED_ID_PLACEHOLDER,
			key: "",
			val: "",
			enabled: "on",
		},
	]);
	public urlEncodedParams = computed(() => this._urlEncodedParams());

	public addUrlEncodedField() {
		this._urlEncodedParams.update((prev) => {
			const placeholderItemIndex = prev.findIndex(
				(x) => x.id === URLENCODED_ID_PLACEHOLDER,
			);

			if (placeholderItemIndex >= 0) {
				return prev;
			}

			return [
				...prev,
				{
					id: URLENCODED_ID_PLACEHOLDER,
					key: "",
					val: "",
					enabled: "on",
				},
			];
		});
	}

	public updateUrlEncodedField(
		id: string,
		prop: Exclude<keyof KeyValItem, "id">,
		v: string,
	) {
		this._urlEncodedParams.update((prev) => {
			const index = prev.findIndex((x) => x.id === id);
			if (index === -1) {
				return prev;
			}

			const copy = [...prev];
			copy[index][prop] = v;

			if (id === URLENCODED_ID_PLACEHOLDER) {
				copy[index].id = nanoid();
			}

			this.urlEncodedChange$.next(copy);

			return copy;
		});
	}

	public deleteUrlEncodedField(id: string) {
		this._urlEncodedParams.update((prev) => {
			const copy = prev.filter((x) => x.id !== id);
			this.urlEncodedChange$.next(copy);
			return copy;
		});
	}
	//#endregion UrlEncoded

	//#region Binary
	private _binaryBody = signal<models.FileStats | null>(null);
	public binaryBody = computed(() => this._binaryBody());

	public setBinaryBody(v: models.FileStats) {
		this._binaryBody.set(v);
		this.binaryBChange$.next(v);
	}

	public clearBinaryBody() {
		this._binaryBody.set(null);
		this.binaryBChange$.next(null);
	}
	//#endregion Binary

	//#region Text
	private _textBody = signal<string>("");
	public textBody = computed(() => this._textBody());
	public setTextBody(v: string) {
		this._textBody.set(v);
		this.textBChange$.next(v);
	}
	//#endregion Text

	//#endregion Body

	//#region Request-Response

	private _res = signal<models.GurlRes | null>(null);

	public res = computed(() => this._res());

	private _headersPreviewMode = signal<boolean>(true);

	public headersPreviewMode = computed(() => this._headersPreviewMode());

	public toggleHeadersPreview() {
		this._headersPreviewMode.update((x) => !x);
	}

	public headersRaw = computed(() => {
		return this._res()?.headers.reduce((acc, curr) => {
			acc += `${curr.key}: ${curr.value}\n`;
			return acc;
		}, "");
	});

	private populateInitialState(data: models.RequestDraftDTO) {
		try {
			const {
				method,
				url,
				query,
				headers,
				bodyType,
				multipart,
				urlencoded,
				binary,
				text,
				cookies,
			} = data;

			this._url.set(url);
			this._method.set(
				REQ_METHODS.find((x) => x.id === method) || REQ_METHODS[0],
			);
			this._headers.set([
				...JSON.parse(headers),
				{
					id: HID_PLACEHOLDER,
					key: "",
					val: "",
					enabled: "on",
				},
			]);

			this._cookies.set([
				...JSON.parse(cookies),
				{
					id: COOKIE_PLACEHOLDER,
					key: "",
					val: "",
					enabled: "on",
				},
			]);

			this._queryParams.set([
				...JSON.parse(query),
				{
					id: QID_PLACEHOLDER,
					key: "",
					val: "",
					enabled: "on",
				},
			]);

			this._bodyType.set(
				REQ_BODY_TYPES.find((x) => x.id === bodyType) || REQ_BODY_TYPES[0],
			);
			this._textBody.set(text);
			this._urlEncodedParams.set([
				...JSON.parse(urlencoded),
				{
					id: URLENCODED_ID_PLACEHOLDER,
					key: "",
					val: "",
					enabled: "on",
				},
			]);
			this._multiPartForm.set([
				...JSON.parse(multipart),
				{
					id: MULTIPART_ID_PLACEHOLDER,
					key: "",
					val: "",
					enabled: "on",
				},
			]);
			this._binaryBody.set(binary ? JSON.parse(binary) : null);
		} catch (_error) {}
	}

	public async initializeReqForm(id: string) {
		try {
			console.log(`Initializing draft ${id}`);
			this._requestId = id;
			const dbRequest = await FindDraftById(id);
			if (!dbRequest) {
				//TODO: Warn using Toast message
				return;
			}

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

	public before() {
		this._reqStatus.set("progress");
		this._res.set(null);
	}

	public clearResponse() {
		this._reqStatus.set("idle");
		this._res.set(null);
	}

	public async send() {
		if (!this.isValidUrl()) {
			console.log(`invalid URL`);
			return;
		}

		if (this._url() === "") {
			return;
		}

		try {
			this.before();
			const payload: Partial<models.GurlReq> = {
				id: this._requestId,
				url: this._url(),
				method: this._method().id,
				query: this._queryParams().reduce((prev, curr) => {
					if (curr.key && curr.key !== QID_PLACEHOLDER) {
						prev.push({
							key: curr.key,
							value: curr.val,
							enabled: curr.enabled === "on",
						});
					}
					return prev;
				}, [] as models.GurlKeyValItem[]),
				headers: this._headers().reduce((prev, curr) => {
					if (curr.key && curr.key !== HID_PLACEHOLDER) {
						prev.push({
							key: curr.key,
							value: curr.val,
							enabled: curr.enabled === "on",
						});
					}
					return prev;
				}, [] as models.GurlKeyValItem[]),
				cookies: this._cookies().reduce((prev, curr) => {
					if (curr.key && curr.key !== COOKIE_PLACEHOLDER) {
						prev.push({
							key: curr.key,
							value: curr.val,
							enabled: curr.enabled === "on",
						});
					}
					return prev;
				}, [] as models.GurlKeyValItem[]),
				bodyType: this.bodyType().id,
				binary: this._binaryBody()?.path || "",
				multipart: this._multiPartForm().reduce((prev, curr) => {
					if (curr.key && curr.key !== MULTIPART_ID_PLACEHOLDER) {
						if (typeof curr.val === "string") {
							prev.push({
								key: curr.key,
								value: curr.val,
								isFile: false,
								enabled: curr.enabled === "on",
							});
						} else {
							prev.push({
								key: curr.key,
								isFile: true,
								value: curr.val.path,
								enabled: curr.enabled === "on",
							});
						}
					}
					return prev;
				}, [] as models.GurlKeyValMultiPartItem[]),
				plaintext: this._textBody(),
				urlencoded: this._urlEncodedParams().reduce((prev, curr) => {
					if (curr.key && curr.key !== URLENCODED_ID_PLACEHOLDER) {
						prev.push({
							key: curr.key,
							value: curr.val,
							enabled: curr.enabled === "on",
						});
					}
					return prev;
				}, [] as models.GurlKeyValItem[]),
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
				bodyType: this._bodyType().id,
				success: res.success,
				url: this._url(),
				method: this._method().id,
				headers: this._headers().filter((x) => x.id !== HID_PLACEHOLDER),
				cookies: this._cookies().filter((x) => x.id !== COOKIE_PLACEHOLDER),
				urlEncodedBody: this._urlEncodedParams().filter(
					(x) => x.id !== URLENCODED_ID_PLACEHOLDER,
				),
				multiPartBody: this._multiPartForm().filter(
					(x) => x.id !== MULTIPART_ID_PLACEHOLDER,
				),
				queryParams: this._queryParams().filter(
					(x) => x.id !== QID_PLACEHOLDER,
				),
				binaryBody: this._binaryBody(),
				statusText: res.statusText,
				textBody: this._textBody(),
				executed: Date.now(),
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
