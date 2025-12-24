import {
	computed,
	DestroyRef,
	Injectable,
	inject,
	signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { nanoid } from "nanoid";
import { debounceTime, Subject } from "rxjs";
import {
	CancelReq,
	FindDraftById,
	SaveDraftAsRequest,
	SaveFile,
	SendReq,
	UpdateDraftBinaryBody,
	UpdateDraftBodyType,
	UpdateDraftHeaders,
	UpdateDraftMethod,
	UpdateDraftMultipartForm,
	UpdateDraftQuery,
	UpdateDraftTextBody,
	UpdateDraftUrl,
	UpdateDraftUrlEncodedForm,
} from "../../../wailsjs/go/main/Gurl";
import type { models } from "../../../wailsjs/go/models";
import { ClipboardSetText } from "../../../wailsjs/runtime";

import {
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
} from "../../constants";
import type {
	DraftParentMetadata,
	DropDownItem,
	KeyValItem,
	MultipartItem,
	ReqBodyType,
	ReqState,
	ReqTabId,
	RequestHeaders,
	RequestMethod,
	RequestQuery,
	ResStatsType,
	ResTabId,
} from "../../types";
import { AppService } from "./app.service";
import { TabsService } from "./tabs.service";

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
		this.textBChange$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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

	//#region save-request
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
	//#endregion save-request

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

	//#region Headers
	private _headers = signal<RequestHeaders>([
		{
			id: HID_PLACEHOLDER,
			key: "",
			val: "",
			enabled: "on",
		},
	]);
	public headers = computed(() => this._headers());
	public headerCount = computed(() => this._headers.length);
	private _resHeaders = signal<models.GurlKeyValItem[]>([]);
	public resHeaders = computed(() => this._resHeaders());

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

	private _copyStatus = signal<"idle" | "failed" | "done">("idle");

	public copyStatus = computed(()=> this._copyStatus());

	public async copyTextResponseToClipboard() {
		try {
			const copied = await ClipboardSetText(this.responseBody()?.textContent || '');
			if(copied) {
				this._copyStatus.set("done");
			}
			else {
				this._copyStatus.set("failed");
			}

			setTimeout(()=> {
				if(copied) {
					this._copyStatus.set("idle");
				}
			}, 600);	
		} catch (error) {
			console.error(error);
		}
	}

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

	private _resBody = signal<models.GurlBody | undefined>(undefined);
	public responseBody = computed(() => this._resBody());
	private _reqStatus = signal<ReqState>("idle");
	public reqState = computed(() => this._reqStatus());
	private _resStats = signal<ResStatsType>(null);
	public resStats = computed(() => this._resStats());
	public before() {
		this._reqStatus.set("progress");
		this._resHeaders.set([]);
		this._resStats.set(null);
		this._resBody.set(undefined);
	}

	public clearResponse() {
		this._resBody.set(undefined);
		this._resStats.set(null);
		this._resHeaders.set([]);
		this._reqStatus.set("idle");
	}

	public async send() {
		if (!this.isValidUrl()) {
			console.log(`invalid URL`);
			return;
		}

		try {
			this.before();
			const payload: Partial<models.GurlReq> = {
				id: this._requestId,
				method: this.method().id,
				headers: [],
				bodyType: this.bodyType().id,
				binary: "",
				multipart: [],
				plaintext: "",
				urlencoded: [],
			};

			//query
			const params = new URLSearchParams(
				this.queryParams().reduce(
					(prev, curr) => {
						if (
							curr.key &&
							curr.key !== QID_PLACEHOLDER &&
							curr.enabled === "on"
						) {
							prev[curr.key] = curr.val;
						}
						return prev;
					},
					{} as Record<string, string>,
				),
			);

			const endpointURL = params.size
				? `${this.url()}?${params.toString()}`
				: this.url();

			payload.url = endpointURL;

			//headers
			for (const h of this.headers()) {
				if (h.key && h.key !== HID_PLACEHOLDER && h.enabled === "on") {
					payload.headers?.push({ key: h.key, value: h.val });
				}
			}

			switch (this.bodyType().id) {
				case "json":
				case "plaintext":
				case "xml": {
					payload.plaintext = this.textBody();
					break;
				}
				case "multipart": {
					for (const field of this.multipartForm()) {
						if (
							field.key &&
							field.key !== MULTIPART_ID_PLACEHOLDER &&
							field.enabled === "on"
						) {
							if (typeof field.val === "string") {
								payload.multipart?.push({
									key: field.key,
									isFile: false,
									value: field.val,
								});
							} else {
								payload.multipart?.push({
									key: field.key,
									isFile: true,
									value: field.val.path,
								});
							}
						}
					}
					break;
				}
				case "urlencoded": {
					for (const field of this.urlEncodedParams()) {
						if (
							field.key &&
							field.key !== URLENCODED_ID_PLACEHOLDER &&
							field.enabled
						) {
							payload.urlencoded?.push({
								key: field.key,
								value: field.val,
							});
						}
					}
					break;
				}
				case "binary": {
					const binaryB = this.binaryBody();
					if (binaryB) {
						payload.binary = binaryB.path;
					}
					break;
				}

				default: {
					break;
				}
			}

			console.dir(payload);

			const res = await SendReq(payload as models.GurlReq);

			this._resHeaders.set(res.headers);
			this._resStats.set({
				size: res.size,
				status: res.status,
				statusText: res.statusText,
				success: res.success,
				time: res.time,
			});

			this._resBody.set(res.body);
			this._reqStatus.set("success");

			this._appSvc.addHistoryItem({
				id: nanoid(),
				bodyType: this._bodyType().id,
				success: res.success,
				url: this._url(),
				method: this._method().id,
				headers: this._headers().filter((x) => x.id !== HID_PLACEHOLDER),
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
			this._reqStatus.set("error");
			console.error(error);
		}
	}

	public async saveToFile() {
		try {
			const b = this._resBody();
			if (!b) {
				return;
			}
			await SaveFile(b.filepath, b.extension);
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
