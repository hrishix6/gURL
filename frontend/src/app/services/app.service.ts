import {
	computed,
	DestroyRef,
	effect,
	Injectable,
	inject,
	signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { nanoid } from "nanoid";
import { debounceTime, Subject } from "rxjs";
import {
	AddCollection,
	GetAllCollections,
	GetSavedRequests,
} from "../../../wailsjs/go/main/Gurl";
import type { models } from "../../../wailsjs/go/models";
import {
	DEFAULT_THEME,
	SUPPORTED_THEMES,
	THEME_LOCALSTORAGE_KEY,
} from "../../constants";
import type { DropDownItem } from "../../types";
import {
	AppSidebarContent,
	type AppState,
	type AppTheme,
	FormLayout,
	type ReqHistoryItem,
} from "../../types";
import { TabsService } from "./tabs.service";

@Injectable({
	providedIn: "root",
})
export class AppService {
	private _appState = signal<AppState>("initializing");
	public appState = computed(() => this._appState());
	private tabSvc = inject(TabsService);
	private destoyRef = inject(DestroyRef);

	//#region environments
	private _environments = signal<DropDownItem<string>[]>([
		{
			id: "none",
			displayName: "No environment",
		},
	]);

	private _activeEnvironment = signal<DropDownItem<string>>(
		this._environments()[0],
	);

	public environments = computed(() => this._environments());
	public activeEnvironment = computed(() => this._activeEnvironment());

	public setActiveEnvironment(id: string) {
		const index = this._environments().findIndex((x) => x.id === id);
		if (index > -1) {
			this._activeEnvironment.set(this._environments()[index]);
		}
	}
	//#endregion environments

	//#region history
	private _historyItems = signal<ReqHistoryItem[]>([]);
	public searchHistoryKeyChange$ = new Subject<string>();
	private _searchHistoryKey = signal<string>("");
	public historyItems = computed(() => {
		const key = this._searchHistoryKey().toLocaleLowerCase();

		if (!key) {
			return this._historyItems();
		}

		return this._historyItems().filter(
			(item) =>
				item.method.toLowerCase().includes(key) ||
				item.url?.includes(key) ||
				item.statusText?.toLocaleLowerCase().includes(key),
		);
	});

	public addHistoryItem(item: ReqHistoryItem) {
		this._historyItems.update((prev) => {
			return [item, ...prev];
		});
	}

	//#endregion history

	//#region requests
	public refreshSavedRequests$ = new Subject<void>();
	private _savedRequests = signal<models.RequestDTO[]>([]);
	public savedRequests = computed(() => {
		const key = this._collectionSearchKey();

		if (!key || key.trim() === "") {
			return this._savedRequests();
		}

		const normalizedKey = key.toLocaleLowerCase();
		return this._savedRequests().filter(
			(req) =>
				req.method.toLocaleLowerCase().includes(normalizedKey) ||
				req.name?.toLocaleLowerCase().includes(normalizedKey) ||
				req.url?.toLocaleLowerCase().includes(normalizedKey),
		);
	});
	//#endregion requests

	//#region collections
	public refreshCollections$ = new Subject<void>();
	public collectionSearchKeyChange$ = new Subject<string>();
	private _collections = signal<models.CollectionDTO[]>([]);
	private _collectionSearchKey = signal<string>("");
	public collections = computed(() => this._collections());

	public async addCollection(name: string) {
		const newCollection: models.AddCollectionDTO = {
			id: nanoid(),
			name,
		};
		try {
			await AddCollection(newCollection);
			this.refreshCollections$.next();
		} catch (error) {
			console.error(error);
		} finally {
			this._collectionModalOpen.set(false);
		}
	}
	//#endregion collections

	//#region Modals
	private _collectionModalOpen = signal<boolean>(false);
	public isCollectionModalOpen = computed(() => this._collectionModalOpen());

	public toggleCollectionModal() {
		this._collectionModalOpen.update((x) => !x);
	}
	//#endregion Modals

	//#region layout
	private _formLayout = signal<FormLayout>(FormLayout.Horizontal);
	public formLayout = computed(() => this._formLayout());
	public toggleLayout() {
		this._formLayout.update((prev) => {
			if (prev === FormLayout.Horizontal) {
				return FormLayout.Vertical;
			}
			return FormLayout.Horizontal;
		});
	}

	//#endregion layout

	//#region theme
	private _activeTheme = signal<AppTheme | null>(null);
	public activeTheme = computed(() => this._activeTheme());

	private isAppTheme(theme: unknown): theme is AppTheme {
		return SUPPORTED_THEMES.some((x) => x.id === theme);
	}

	public setActiveTheme(theme: AppTheme) {
		this._activeTheme.set(theme);
	}
	//#endregion theme

	//#region sidebar
	private _appSidebarContent = signal<AppSidebarContent>(
		AppSidebarContent.Collections,
	);
	public appSidebarContent = computed(() => this._appSidebarContent());
	public setCurrentSidebarContent(contentType: AppSidebarContent) {
		this._appSidebarContent.set(contentType);
	}

	//#region desktop-sidebar
	private _isDesktopSidebarOpen = signal<boolean>(true);
	public isDesktopSidebarOpen = computed(() => this._isDesktopSidebarOpen());

	public toggleDesktopSidebar() {
		this._isDesktopSidebarOpen.update((x) => !x);
	}
	//#endregion desktop-sidebar

	//#region mobile-sidebar
	private _isMobileSidebarOpen = signal<boolean>(false);
	public isMobileSidebarOpen = computed(() => this._isMobileSidebarOpen());

	public toggleMobileSidebar() {
		this._isMobileSidebarOpen.update((x) => !x);
	}

	//#endregion mobile-sidebar

	//#endregion sidebar

	//#region workspaces
	private _workspaces = signal<DropDownItem<string>[]>([
		{
			id: "default",
			displayName: "Default",
		},
		{
			id: "workspace1",
			displayName: "Workspace1",
		},
		{
			id: "workspace2",
			displayName: "Workspace2",
		},
	]);

	private _activeWorkspace = signal<DropDownItem<string>>(
		this._workspaces()[0],
	);
	public activeWorkSpace = computed(() => this._activeWorkspace());

	public workspaces = computed(() => this._workspaces());

	public setActiveWorkspace(id: string) {
		const index = this._workspaces().findIndex((x) => x.id === id);
		if (index > -1) {
			this._activeWorkspace.set(this._workspaces()[index]);
		}
	}
	//#endregion workspaces

	constructor() {
		effect(() => {
			const newTheme = this._activeTheme();
			if (newTheme) {
				document.documentElement.dataset["theme"] = newTheme;
				window.localStorage.setItem(THEME_LOCALSTORAGE_KEY, newTheme);
			}
		});

		this.searchHistoryKeyChange$
			.pipe(takeUntilDestroyed(this.destoyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					this._searchHistoryKey.set(v);
				},
			});

		this.refreshCollections$
			.pipe(takeUntilDestroyed(this.destoyRef))
			.subscribe({
				next: () => {
					console.log(`refreshing collections from db`);
					this.initializeCollections();
				},
			});

		this.refreshSavedRequests$
			.pipe(takeUntilDestroyed(this.destoyRef))
			.subscribe({
				next: () => {
					console.log(`refreshing saved requests from db`);
					this.initializeSavedRequests();
				},
			});

		this.collectionSearchKeyChange$
			.pipe(takeUntilDestroyed(this.destoyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					this._collectionSearchKey.set(v);
				},
			});
	}

	//#region init

	initializeAppPreferences() {
		const theme = window.localStorage.getItem(THEME_LOCALSTORAGE_KEY);
		if (this.isAppTheme(theme)) {
			this._activeTheme.set(theme);
		} else {
			this._activeTheme.set(DEFAULT_THEME);
		}
	}

	async initializeCollections() {
		try {
			const collections = await GetAllCollections();
			if (Array.isArray(collections) && collections.length) {
				this._collections.set(collections);
			}
		} catch (error) {
			console.error(error);
		}
	}

	async initializeSavedRequests() {
		try {
			const savedRequests = await GetSavedRequests();

			if (Array.isArray(savedRequests) && savedRequests.length) {
				this._savedRequests.set(savedRequests);
			}
		} catch (error) {
			console.error(error);
		}
	}

	public async init() {
		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			//initialize collections + saved requests
			await this.initializeCollections();
			await this.initializeSavedRequests();
			//initialize tabs
			await this.tabSvc.init();
			this._appState.set("loaded");
		} catch (_error) {
			this._appState.set("error");
		}
	}

	//#endregion init
}
