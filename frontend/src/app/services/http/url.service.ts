import { computed, type DestroyRef, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { models } from "@wailsjs/go/models";
import {
	UpdateDraftMethod,
	UpdateDraftQuery,
	UpdateDraftUrl,
} from "@wailsjs/go/storage/Storage";
import { nanoid } from "nanoid";
import { debounceTime, Subject } from "rxjs";
import { QID_PLACEHOLDER, REQ_METHODS } from "@/constants";
import type {
	DropDownItem,
	KeyValItem,
	RequestMethod,
	RequestQuery,
} from "@/types";

export class UrlService {
	private draftId = "";
	private destroyRef: DestroyRef;
	private methodDbSync$ = new Subject<RequestMethod>();
	private urlDbSync$ = new Subject<string>();
	private queryDbSync$ = new Subject<KeyValItem[]>();

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
	}

	private _queryParams = signal<RequestQuery>([
		{
			id: QID_PLACEHOLDER,
			key: "",
			val: "",
			enabled: "on",
		},
	]);

	private _url = signal<string>("");
	public url = computed(() => this._url());
	private _isUrlValid = signal<boolean>(true);
	public isValidUrl = computed(() => this._isUrlValid());

	public setUrl(v: string) {
		this._isUrlValid.set(true);
		this._url.set(v);
		this.urlDbSync$.next(v);
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
		this.queryDbSync$.next(newParams);
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

			this.queryDbSync$.next(copy);
			return copy;
		});
	}

	public deleteQueryParam(id: string) {
		this._queryParams.update((prev) => {
			const copy = prev.filter((x) => x.id !== id);
			this.queryDbSync$.next(copy);
			return copy;
		});
	}

	public requestQueryParams() {
		return this._queryParams().reduce((prev, curr) => {
			if (curr.key && curr.key !== QID_PLACEHOLDER) {
				prev.push({
					key: curr.key,
					value: curr.val,
					enabled: curr.enabled === "on",
				});
			}
			return prev;
		}, [] as models.GurlKeyValItem[]);
	}

	constructor(destroyRef: DestroyRef) {
		this.destroyRef = destroyRef;

		this.methodDbSync$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: (v) => {
				UpdateDraftMethod({
					requestId: this.draftId,
					method: v,
				}).then(() => {
					console.log(`[${this.draftId}] method set to ${v} in SQlite`);
				});
			},
		});

		this.urlDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					UpdateDraftUrl({
						requestId: this.draftId,
						url: v,
					}).then(() => {
						console.log(`[${this.draftId}] url set to ${v} in SQlite`);
					});
				},
			});

		this.queryDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					const payload = v.filter((x) => x.id !== QID_PLACEHOLDER);
					UpdateDraftQuery({
						requestId: this.draftId,
						queryJson: JSON.stringify(payload),
					}).then(() => {
						console.log(`[${this.draftId}] query updated in SQlite`);
					});
				},
			});
	}
}
