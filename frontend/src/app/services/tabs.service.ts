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
	AddDraft,
	AddFreshDraft,
	GetOpenTabs,
	RemoveDraft,
	UpdateOpenTabs,
} from "../../../wailsjs/go/main/Gurl";
import type { models } from "../../../wailsjs/go/models";
import { type ApplicationTab, AppTabType, type ReqHistoryItem } from "../../types";

@Injectable({
	providedIn: "root",
})
export class TabsService {
	private _openTabs = signal<ApplicationTab[]>([]);
	private _activeTab = signal<string | null>("");
	public openTabs = computed(() => this._openTabs());
	public activeTab = computed(() => this._activeTab());
	public destoyRef = inject(DestroyRef);
	private tabChanges$ = new Subject<ApplicationTab[]>();
	private reqChanges$ = new Subject<string>();
	public tabCount = computed(() => this._openTabs().length);

	constructor() {
		this.tabChanges$
			.pipe(takeUntilDestroyed(this.destoyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					UpdateOpenTabs({
						openTabsJson: JSON.stringify(v),
					})
						.then(() => {
							console.log(`updated tabs state in sqlite`);
						})
						.catch((err) => {
							console.error(err);
						});
				},
			});

		this.reqChanges$.pipe(takeUntilDestroyed(this.destoyRef)).subscribe({
			next: (v) => {
				RemoveDraft(v)
					.then(() => {
						console.log(`request with id ${v} is deleted from db`);
					})
					.catch((_err) => {
						console.log(`failed to delete request with id ${v} from db`);
					});
			},
		});
	}

	public async createTabFromSaved(item: models.RequestDTO) {
		try {
			const newDraft: models.RequestDraftDTO = {
				id: nanoid(),
				url: item.url,
				method: item.method,
				parentRequestId: item.id,
				parentRequestName: item.name,
				parentCollectionId: item.collectionId,
				query: item.query,
				bodyType: item.bodyType,
				headers: item.headers,
				binary: item.binary,
				multipart: item.multipart,
				text: item.text,
				urlencoded: item.urlencoded,
			};

			await AddDraft(newDraft);

			const newTab: ApplicationTab = {
				id: nanoid(),
				name: item.name,
				tag: item.method,
				entityId: newDraft.id,
				entityType: AppTabType.Req,
			};

			this._openTabs.update((prev) => {
				const copy = [...prev, newTab];
				this.tabChanges$.next(copy);
				return copy;
			});

			this._activeTab.set(newTab.id);
		} catch (error) {
			console.error(error);
		}
	}

	public async createTabFromHistory(item: ReqHistoryItem) {
		try {
			const newDraft: models.RequestDraftDTO = {
				id: nanoid(),
				url: item.url,
				method: item.method,
				parentRequestId: "",
				parentRequestName: "",
				parentCollectionId: "",
				query: JSON.stringify(item.queryParams),
				bodyType: item.bodyType,
				headers: JSON.stringify(item.headers),
				binary: item.binaryBody ? JSON.stringify(item.binaryBody) : "",
				multipart: JSON.stringify(item.multiPartBody),
				text: item.textBody,
				urlencoded: JSON.stringify(item.urlEncodedBody),
			};

			await AddDraft(newDraft);

			const newTab: ApplicationTab = {
				id: nanoid(),
				name: item.url,
				tag: item.method,
				entityId: newDraft.id,
				entityType: AppTabType.Req,
			};

			this._openTabs.update((prev) => {
				const copy = [...prev, newTab];
				this.tabChanges$.next(copy);
				return copy;
			});

			this._activeTab.set(newTab.id);
		} catch (error) {
			console.error(error);
		}
	}

	public async createFreshTab() {
		try {
			const newDraft: models.AddFreshDraftDTO = {
				id: nanoid(),
			};

			const newTab: ApplicationTab = {
				id: nanoid(),
				entityId: newDraft.id,
				entityType: AppTabType.Req,
				name: "New Request",
				tag: "GET",
			};

			await AddFreshDraft(newDraft);

			this._openTabs.update((prev) => {
				const copy = [...prev, newTab];
				this.tabChanges$.next(copy);
				return copy;
			});

			this._activeTab.set(newTab.id);
		} catch (error) {
			console.error(error);
		}
	}

	public deleteTab(id: string) {
		this._openTabs.update((prev) => {
			const i = prev.findIndex((x) => x.id === id);
			if (i === -1) {
				return prev;
			}

			if (this._activeTab() === id) {
				const nextTab = prev[i + 1];
				const prevTab = prev[i - 1];
				const newTabId = nextTab?.id || prevTab?.id || null;
				this._activeTab.set(newTabId);
			}

			this.reqChanges$.next(prev[i].entityId);
			const copy = prev.filter((x) => x.id !== id);
			this.tabChanges$.next(copy);

			return copy;
		});
	}

	public setActiveTab(id: string | null) {
		const i = this._openTabs().findIndex((x) => x.id === id);
		if (i >= 0) {
			this._activeTab.set(id);
		}
	}

	public updateActiveTab(
		prop: Exclude<keyof ApplicationTab, "id" | "entityType" | "entityId">,
		v: string,
	) {
		this._openTabs.update((prev) => {
			const i = prev.findIndex((x) => x.id === this._activeTab());

			if (i === -1) {
				return prev;
			}
			const copy = [...prev];
			copy[i][prop] = v;

			this.tabChanges$.next(copy);
			return copy;
		});
	}

	async init() {
		try {
			const savedTabs = await GetOpenTabs();
			const parsedTabs: ApplicationTab[] = JSON.parse(savedTabs);
			if (Array.isArray(parsedTabs) && parsedTabs.length) {
				this._openTabs.set(parsedTabs);
				this._activeTab.set(parsedTabs[0].id);
			} else {
				this.createFreshTab();
			}
		} catch (error) {
			console.error(error);
		}
	}
}
