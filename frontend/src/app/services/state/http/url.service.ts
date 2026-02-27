import { computed, type DestroyRef, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { models } from "@wailsjs/go/models";
import { nanoid } from "nanoid";
import { debounceTime, Subject } from "rxjs";
import { extractTokens } from "@/common/utils/tokens";
import { QID_PLACEHOLDER, REQ_METHODS } from "@/constants";
import { getReqRepository } from "@/services";
import type { DropDownItem, InputToken, RequestMethod } from "@/types";

export class UrlService {
	private draftId = "";
	private destroyRef: DestroyRef;
	private methodDbSync$ = new Subject<RequestMethod>();
	private urlDbSync$ = new Subject<string>();
	private reqRepo = getReqRepository();
	private queryDbSync$ = new Subject<models.GurlKeyValItem[]>();

	public init(data: models.RequestDraftDTO) {
		this.draftId = data.id;
		this._url.set(data.url);
		this._method.set(
			REQ_METHODS.find((x) => x.id === data.method) || REQ_METHODS[0],
		);
		this._queryParams.set([
			...JSON.parse(data.query),
			{
				id: QID_PLACEHOLDER,
				key: "",
				val: "",
				enabled: "on",
			},
		]);
		this._pathParams.set([...JSON.parse(data.path)]);
	}

	public initExample(data: models.ReqExampleDTO) {
		this.draftId = data.id;
		this._url.set(data.url);
		this._method.set(
			REQ_METHODS.find((x) => x.id === data.method) || REQ_METHODS[0],
		);
		this._queryParams.set([...JSON.parse(data.query)]);
	}

	private _queryParams = signal<models.GurlKeyValItem[]>([
		{
			id: QID_PLACEHOLDER,
			key: "",
			val: "",
			enabled: "on",
		},
	]);

	private _pathParams = signal<models.GurlKeyValItem[]>([]);
	public pathParams = computed(() => this._pathParams());
	private pathDbSync$ = new Subject<models.GurlKeyValItem[]>();

	private _url = signal<string>("");
	public url = computed(() => this._url());
	private _isUrlValid = signal<boolean>(true);
	public isValidUrl = computed(() => this._isUrlValid());

	public setUrl(v: string) {
		let modified = false;
		this._url.update((prev) => {
			if (prev === v) {
				return prev;
			}

			modified = true;
			this.urlDbSync$.next(v);
			return v;
		});

		return modified;
	}

	public _parseUrl() {
		try {
			const parsed = new URL(this._url());
			const baseUrl = `${parsed.origin}${parsed.pathname}`;
			const searchParams = parsed.searchParams;

			if (searchParams.size) {
				this.appendQueryParams(searchParams);
			}

			const decoded = decodeURIComponent(baseUrl);
			this.appendPathParams(decoded);
			return this.setUrl(decoded);
		} catch (_error) {
			console.error(`invalid URL: ${_error}`);
			const v = this._url();
			this.appendPathParams(v);
			return false;
		}
	}

	private setPathParams(items: models.GurlKeyValItem[]) {
		this._pathParams.set(items);
		this.pathDbSync$.next(items);
	}

	public updatePathParam(
		id: string,
		prop: Exclude<keyof models.GurlKeyValItem, "id">,
		v: string,
	) {
		this._pathParams.update((prev) => {
			const i = prev.findIndex((x) => x.id === id);
			if (i === -1) {
				return prev;
			}
			const copy = [...prev];

			copy[i][prop] = v;

			this.pathDbSync$.next(copy);
			return copy;
		});
	}

	private appendPathParams(v: string) {
		const tokens = extractTokens(v);
		const pathParams: models.GurlKeyValItem[] = [];
		for (const token of tokens) {
			if (token.type === "path") {
				pathParams.push({
					id: nanoid(),
					enabled: "on",
					key: token.key,
					val: "",
				});
			}
		}
		this.setPathParams(pathParams);
	}

	public validateInterpolatedPathToken(token: InputToken): [boolean, string] {
		const params = this._pathParams();

		if (!params.length) {
			return [false, ""];
		}

		const index = params.findIndex((x) => x.key === token.key);

		if (index === -1) {
			return [false, ""];
		}

		const v = params[index].val;
		const valid = v?.trim() !== "";

		return [valid, v];
	}

	private _method = signal<DropDownItem<RequestMethod>>(REQ_METHODS[0]);
	public method = computed(() => this._method());

	public setSelectedMethod(method: RequestMethod) {
		const itemIndex = REQ_METHODS.findIndex((x) => x.id === method);
		if (itemIndex > -1) {
			const selectedMethod = REQ_METHODS[itemIndex];
			this._method.set(selectedMethod);
			this.methodDbSync$.next(method);
		}
	}

	private appendQueryParams(params: URLSearchParams) {
		this._queryParams.update((_) => {
			const newParams: models.GurlKeyValItem[] = [];
			for (const [k, v] of params.entries()) {
				const newId = nanoid();
				newParams.push({
					id: newId,
					key: k,
					val: v,
					enabled: "on",
				});
			}

			this.queryDbSync$.next(newParams);

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

	public _bulkUpdateQueryParams(items: models.GurlKeyValItem[]) {
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
		this.queryDbSync$.next(newParams);
	}

	public _updateQueryParam(
		id: string,
		prop: Exclude<keyof models.GurlKeyValItem, "id">,
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

			this.queryDbSync$.next(copy);
			return copy;
		});
	}

	public _deleteQueryParam(id: string) {
		this._queryParams.update((prev) => {
			const copy = prev.filter((x) => x.id !== id);
			this.queryDbSync$.next(copy);
			return copy;
		});
	}

	public queryParamsForExample() {
		return this._queryParams().filter((x) => x.id !== QID_PLACEHOLDER);
	}

	public requestQueryParams() {
		return this._queryParams().filter((x) => x.id !== QID_PLACEHOLDER);
	}

	constructor(destroyRef: DestroyRef) {
		this.destroyRef = destroyRef;
		this.methodDbSync$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: (v) => {
				this.reqRepo
					.updatereqDraftFields({
						draftId: this.draftId,
						method: v,
					})
					.then(() => {
						console.log(`[${this.draftId}] method set to ${v} in SQlite`);
					});
			},
		});

		this.urlDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					this.reqRepo
						.updatereqDraftFields({
							draftId: this.draftId,
							url: v,
						})
						.then(() => {
							console.log(`[${this.draftId}] url set to ${v} in SQlite`);
						});
				},
			});

		this.queryDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					const payload = v.filter((x) => x.id !== QID_PLACEHOLDER);
					this.reqRepo
						.updatereqDraftFields({
							draftId: this.draftId,
							queryJson: JSON.stringify(payload),
						})
						.then(() => {
							console.log(`[${this.draftId}] query updated in SQlite`);
						});
				},
			});

		this.pathDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					this.reqRepo
						.updatereqDraftFields({
							draftId: this.draftId,
							pathJson: JSON.stringify(v),
						})
						.then(() => {
							console.log(`[${this.draftId}] path updated in SQlite`);
						});
				},
			});
	}
}
