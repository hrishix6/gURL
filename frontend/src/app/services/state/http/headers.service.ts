import { computed, type DestroyRef, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { models } from "@wailsjs/go/models";
import { nanoid } from "nanoid";
import { debounceTime, Subject } from "rxjs";
import { keyValToBulkEditText } from "@/common/utils/text";
import { HID_PLACEHOLDER } from "@/constants";

export class HeadersService {
	private destroyRef: DestroyRef;
	private readonly dbSyncFn: (v: models.GurlKeyValItem[]) => void;

	public init(data: models.RequestDraftDTO) {
		const { headers } = data;
		this._headers.set([
			...JSON.parse(headers),
			{
				id: HID_PLACEHOLDER,
				key: "",
				val: "",
				enabled: "on",
			},
		]);
	}

	public initMock(headers: string) {
		this._headers.set([
			...JSON.parse(headers),
			{
				id: HID_PLACEHOLDER,
				key: "",
				val: "",
				enabled: "on",
			},
		]);
	}

	public initExample(data: models.ReqExampleDTO) {
		const { headers } = data;
		this._headers.set([...JSON.parse(headers)]);
	}

	private headersDbSync$ = new Subject<models.GurlKeyValItem[]>();

	private _headers = signal<models.GurlKeyValItem[]>([
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
		return keyValToBulkEditText(this._headers(), HID_PLACEHOLDER);
	});

	public _bulkUpdateHeadersParams(items: models.GurlKeyValItem[]) {
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
		this.headersDbSync$.next(newParams);
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

	public _updateHeader(
		id: string,
		prop: Exclude<keyof models.GurlKeyValItem, "id">,
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

			this.headersDbSync$.next(copy);
			return copy;
		});
	}

	public _deleteHeader(id: string) {
		this._headers.update((prev) => {
			const copy = prev.filter((x) => x.id !== id);
			this.headersDbSync$.next(copy);
			return copy;
		});
	}

	public requestHeaders(): models.GurlKeyValItem[] {
		return this._headers().filter((x) => x.id !== HID_PLACEHOLDER);
	}

	public headersForExample(): models.GurlKeyValItem[] {
		return this._headers().filter((x) => x.id !== HID_PLACEHOLDER);
	}

	constructor(
		destroyRef: DestroyRef,
		dbSyncFn: (v: models.GurlKeyValItem[]) => void,
	) {
		this.destroyRef = destroyRef;
		this.dbSyncFn = dbSyncFn;
		this.headersDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					const payload = v.filter((x) => x.id !== HID_PLACEHOLDER);
					this.dbSyncFn(payload);
				},
			});
	}
}
