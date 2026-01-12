import {
	computed,
	DestroyRef,
	Injectable,
	inject,
	signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { models } from "@wailsjs/go/models";
import {
	AddDraft,
	AddFreshDraft,
	RemoveDraft,
	UpdateActiveTab,
	UpdateOpenTabs,
} from "@wailsjs/go/storage/Storage";
import { nanoid } from "nanoid";
import { debounceTime, Subject } from "rxjs";
import { type ApplicationTab, AppTabType, type ReqHistoryItem } from "@/types";

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
	private activeTabChanges$ = new Subject<string>();
	private reqChanges$ = new Subject<string>();
	public tabCount = computed(() => this._openTabs().length);

	public refreshNotifier = new Subject<void>();

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

		this.activeTabChanges$.pipe(takeUntilDestroyed(this.destoyRef)).subscribe({
			next: (v) => {
				console.log(`saving tab ${v} as active in db`);
				UpdateActiveTab(v);
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
				cookies: item.cookies,
				binary: item.binary,
				multipart: item.multipart,
				text: item.text,
				urlencoded: item.urlencoded,
			};

			console.dir(newDraft);

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

			this.setActiveTab(newTab.id);
		} catch (error) {
			console.error(error);
		}
	}

	public async createDuplicateTab(newDraft: models.RequestDraftDTO) {
		try {
			await AddDraft(newDraft);

			const newTab: ApplicationTab = {
				id: nanoid(),
				name: newDraft.url,
				tag: newDraft.method,
				entityId: newDraft.id,
				entityType: AppTabType.Req,
			};

			this._openTabs.update((prev) => {
				const copy = [...prev, newTab];
				this.tabChanges$.next(copy);
				return copy;
			});

			this.setActiveTab(newTab.id);
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
				cookies: JSON.stringify(item.cookies),
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

			this.setActiveTab(newTab.id);
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

			this.setActiveTab(newTab.id);
		} catch (error) {
			console.error(error);
		}
	}

	public deleteTab(id: string) {
		this._openTabs.update((prev) => {
			if (prev.length === 1) {
				return prev;
			}
			const i = prev.findIndex((x) => x.id === id);
			if (i === -1) {
				return prev;
			}

			if (this._activeTab() === id) {
				const nextTab = prev[i + 1];
				const prevTab = prev[i - 1];
				const newTabId = nextTab?.id || prevTab?.id || null;
				console.log(`new active tab id after closing current is ${newTabId}`);
				this.setActiveTab(newTabId);
			}

			this.reqChanges$.next(prev[i].entityId);
			const copy = prev.filter((x) => x.id !== id);
			this.tabChanges$.next(copy);

			return copy;
		});
	}

	public setActiveTab(id: string | null) {
		this._activeTab.set(id);
		this.activeTabChanges$.next(id || "");
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

	public closeTabs(deletedEntities: string[]) {
		this._openTabs.update((prev) => {
			const copy = prev.filter((x) => !deletedEntities.includes(x.entityId));

			const currentActiveTab = prev.find((x) => x.id === this.activeTab());

			if (
				currentActiveTab &&
				deletedEntities.includes(currentActiveTab.entityId)
			) {
				if (copy.length) {
					this.setActiveTab(copy[0].id);
				}
			}

			this.tabChanges$.next(copy);

			if (!copy.length) {
				this.createFreshTab();
			}

			return copy;
		});
	}

	async init(uiState: models.UIStateDTO) {
		try {
			const { openTabsJson, activeTab } = uiState;
			const parsedTabs: ApplicationTab[] = JSON.parse(openTabsJson);
			if (Array.isArray(parsedTabs) && parsedTabs.length) {
				console.log(`populating tabs`);
				this._openTabs.set(parsedTabs);

				if (parsedTabs.findIndex((x) => x.id === activeTab) > -1) {
					this._activeTab.set(activeTab);
				} else {
					this._activeTab.set(parsedTabs[0].id);
				}
			} else {
				this.createFreshTab();
			}
		} catch (error) {
			console.error(error);
		}
	}
}
