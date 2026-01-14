import { computed, type DestroyRef, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { models } from "@wailsjs/go/models";
import { UpdateDraftHeaders } from "@wailsjs/go/storage/Storage";
import { nanoid } from "nanoid";
import { debounceTime, Subject } from "rxjs";
import { HID_PLACEHOLDER } from "@/constants";
import type { KeyValItem, RequestHeaders } from "@/types";

export class HeadersService {
	private draftId = "";
	private destroyRef: DestroyRef;

	public init(data: models.RequestDraftDTO) {
		const { id, headers } = data;
		this.draftId = id;

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

	private headersDbSync$ = new Subject<RequestHeaders>();

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

			this.headersDbSync$.next(copy);
			return copy;
		});
	}

	public deleteHeader(id: string) {
		this._headers.update((prev) => {
			const copy = prev.filter((x) => x.id !== id);
			this.headersDbSync$.next(copy);
			return copy;
		});
	}

	public requestHeaders(): models.GurlKeyValItem[] {
		return this._headers().reduce((prev, curr) => {
			if (curr.key && curr.key !== HID_PLACEHOLDER) {
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
		this.headersDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					const payload = v.filter((x) => x.id !== HID_PLACEHOLDER);
					UpdateDraftHeaders({
						requestId: this.draftId,
						headersJson: JSON.stringify(payload),
					}).then(() => {
						console.log(`[${this.draftId}] headers updated in SQlite`);
					});
				},
			});
	}
}
