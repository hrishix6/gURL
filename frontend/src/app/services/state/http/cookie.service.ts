import { computed, type DestroyRef, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { models } from "@wailsjs/go/models";
import { nanoid } from "nanoid";
import { debounceTime, Subject } from "rxjs";
import { COOKIE_PLACEHOLDER } from "@/constants";
import { getReqRepository } from "@/services";

export class CookieService {
	private draftId = "";
	private destroyRef: DestroyRef;
	private reqRepo = getReqRepository();

	public init(data: models.RequestDraftDTO) {
		const { id, cookies } = data;
		this.draftId = id;

		this._cookies.set([
			...JSON.parse(cookies),
			{
				id: COOKIE_PLACEHOLDER,
				key: "",
				val: "",
				enabled: "on",
			},
		]);
	}

	public initExample(data: models.ReqExampleDTO) {
		const { id, cookies } = data;
		this.draftId = id;

		this._cookies.set([...JSON.parse(cookies)]);
	}

	private cookiesDbSync$ = new Subject<models.GurlKeyValItem[]>();
	private _cookies = signal<models.GurlKeyValItem[]>([
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

	public _bulkUpdateCookieParams(items: models.GurlKeyValItem[]) {
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
		this.cookiesDbSync$.next(newParams);
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

	public _updateCookie(
		id: string,
		prop: Exclude<keyof models.GurlKeyValItem, "id">,
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

			this.cookiesDbSync$.next(copy);
			return copy;
		});
	}

	public _deleteCookie(id: string) {
		this._cookies.update((prev) => {
			const copy = prev.filter((x) => x.id !== id);
			this.cookiesDbSync$.next(copy);
			return copy;
		});
	}

	public cookiesForExample(): models.GurlKeyValItem[] {
		return this._cookies().filter((x) => x.id !== COOKIE_PLACEHOLDER);
	}

	public requestCookies() {
		return this._cookies().filter((x) => x.id !== COOKIE_PLACEHOLDER);
	}

	constructor(destroyRef: DestroyRef) {
		this.destroyRef = destroyRef;

		this.cookiesDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					const payload = v.filter((x) => x.id !== COOKIE_PLACEHOLDER);
					this.reqRepo
						.updatereqDraftFields({
							draftId: this.draftId,
							cookiesJson: JSON.stringify(payload),
						})
						.then(() => {
							console.log(`[${this.draftId}] cookies updated in SQlite`);
						});
				},
			});
	}
}
