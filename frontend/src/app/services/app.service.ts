import {
	computed,
	DestroyRef,
	effect,
	Injectable,
	inject,
	signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
	ExportCollection,
	ExportEnvironment,
	ImportCollection,
	ImportEnvironment,
} from "@wailsjs/go/exporter/Exporter";
import type { models } from "@wailsjs/go/models";
import {
	AddCollection,
	ClearCollection,
	DeleteCollection,
	DeleteDraftsUnderCollection,
	DeleteEnvDraftsUnderEnv,
	DeleteRequestDrafts,
	DeleteSavedReq,
	GetAllCollections,
	GetEnvironments,
	GetSavedRequests,
	GetUIState,
	RemoveEnv,
	RenameCollection,
	SaveRequestCopy,
	UpdateAlwaysDiscardDraftsPreference,
	UpdateAlwaysDiscardEnvDraftsPreference,
	UpdateLayoutPreference,
	UpdateSideBarPreference,
} from "@wailsjs/go/storage/Storage";

import { nanoid } from "nanoid";
import { debounceTime, Subject } from "rxjs";
import {
	DEFAULT_THEME,
	ENV_TOKEN_REGEX,
	ENV_VAR_REGEX,
	NO_ENV_ID,
	SUPPORTED_THEMES,
	THEME_LOCALSTORAGE_KEY,
} from "@/constants";
import {
	type ActiveItemInfo,
	AppSidebarContent,
	type AppState,
	AppTabType,
	type AppTheme,
	type DropDownItem,
	type EnvironmentItem,
	FormLayout,
	type GlobalEnvMap,
	type InputToken,
	type ReqHistoryItem,
} from "@/types";
import { TabsService } from "./tabs.service";

@Injectable({
	providedIn: "root",
})
export class AppService {
	private _appState = signal<AppState>("initializing");
	public appState = computed(() => this._appState());
	private tabSvc = inject(TabsService);
	private destoyRef = inject(DestroyRef);
	private discardReqDraftsDbSync$ = new Subject<boolean>();
	private discardEnvDraftsDbSync$ = new Subject<boolean>();
	public activeEnvChange$ = new Subject<void>();
	public refreshBreadcrumb$ = new Subject<void>();

	private _alwaysDiscardReqDrafts = signal<boolean>(false);
	public alwaysDiscardDrafts = computed(() => this._alwaysDiscardReqDrafts());

	public setAlwaysDiscardDrafts(v: boolean) {
		this._alwaysDiscardReqDrafts.set(v);
		this.discardReqDraftsDbSync$.next(v);
	}

	private _alwaysDiscardEnvDrafts = signal<boolean>(false);
	public alwaysDiscardEnvDrafts = computed(() =>
		this._alwaysDiscardEnvDrafts(),
	);

	public setAlwaysDiscardEnvDrafts(v: boolean) {
		this._alwaysDiscardEnvDrafts.set(v);
		this.discardEnvDraftsDbSync$.next(v);
	}

	public activeItemInfo = signal<ActiveItemInfo>({
		show: false,
		child: "",
		parent: "",
		type: AppTabType.Req,
	});

	//#region environments
	public extractEnvTokens(v: string): InputToken[] {
		const tokens: InputToken[] = [];
		if (v && v.trim() !== "") {
			v.split(ENV_TOKEN_REGEX).forEach((word) => {
				if (word.match(ENV_TOKEN_REGEX) !== null) {
					const innerVar = word.match(ENV_VAR_REGEX);
					const varKey = innerVar ? innerVar[1] : "";
					const envToken: InputToken = {
						type: "env",
						value: word,
						valid: false,
						key: varKey,
						interpolated: "",
					};

					[envToken.valid, envToken.interpolated] =
						this.validateInterpolatedToken(envToken);
					tokens.push(envToken);
				} else {
					if (word !== "") {
						tokens.push({
							type: "text",
							value: word,
							valid: true,
							key: "",
							interpolated: "",
						});
					}
				}
			});
		}
		return tokens;
	}

	public interPolateEnvTokens(v: string): string {
		let o = "";

		const tokens = this.extractEnvTokens(v);

		if (!tokens.length) {
			return o;
		}

		for (const token of tokens) {
			if (token.type === "env") {
				o += token.valid ? token.interpolated : "";
			}

			if (token.type === "text") {
				o += token.value;
			}
		}

		return o;
	}

	public validateInterpolatedToken(token: InputToken): [boolean, string] {
		const currentEnv = this.activeEnvironment();
		if (!currentEnv) {
			return [false, ""];
		}

		const env = this._globalEnvMap()[currentEnv];

		if (!env) {
			return [false, ""];
		}

		if (!Object.keys(env).length) {
			return [false, ""];
		}

		if (token.key in env) {
			return [!!env[token.key], env[token.key] || ""];
		}

		return [false, ""];
	}

	private _envSearchKey = signal<string>("");

	public refreshEnvs$ = new Subject<void>();

	public envSearchKeyChange$ = new Subject<string>();

	private _environments = signal<models.EnvironmentDTO[]>([]);
	public environments = computed(() => {
		const key = this._envSearchKey().toLocaleLowerCase();
		if (!key) {
			return this._environments();
		}

		return this._environments().filter((env) =>
			env.name.toLocaleLowerCase().includes(key),
		);
	});

	private _globalEnvMap = signal<GlobalEnvMap>({});

	public isEnvWithSameNameExists(name: string) {
		const exists = this._environments().findIndex((x) => x.name === name);
		return exists !== -1;
	}

	public environmentDropdownItems = computed<DropDownItem<string>[]>(() => {
		const t = this._environments().map((env) => ({
			id: env.id,
			displayName: env.name,
		}));

		return [{ id: NO_ENV_ID, displayName: "No Environment" }, ...t];
	});

	private _activeEnvironment = signal<string>(NO_ENV_ID);

	public activeEnvironment = computed(() => this._activeEnvironment());

	public setActiveEnvironment(id: string) {
		const index = this.environmentDropdownItems().findIndex((x) => x.id === id);
		if (index > -1) {
			this._activeEnvironment.set(id);
			this.activeEnvChange$.next();
		}
	}

	public async deleteEnvironment(id: string) {
		try {
			await RemoveEnv(id);
			await DeleteEnvDraftsUnderEnv(id);
			await this.initializeEnvironments();
			this.tabSvc.refreshNotifier.next(AppTabType.Env);
		} catch (error) {
			console.error(error);
		}
	}

	public async importEnvironment() {
		try {
			await ImportEnvironment();
			await this.initializeEnvironments();
		} catch (error) {
			console.error(error);
		}
	}

	public async exportEnvironment(id: string) {
		try {
			await ExportEnvironment(id);
		} catch (error) {
			console.error(error);
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

	public async deleteRequest(requestId: string) {
		try {
			await DeleteSavedReq(requestId);
			await DeleteRequestDrafts(requestId);
			//refresh from db
			await this.initializeSavedRequests();
			this.tabSvc.refreshNotifier.next(AppTabType.Req);
		} catch (error) {
			console.error(error);
		}
	}

	public async copyRequest(sourceId: string, name: string) {
		try {
			await SaveRequestCopy({ id: nanoid(), name, sourceId });
			//refresh from db
			await this.initializeSavedRequests();
		} catch (error) {
			console.error(error);
		}
	}

	//#endregion requests

	//#region collections
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
			await this.initializeCollections();
		} catch (error) {
			console.error(error);
		}
	}

	public async deleteCollection(id: string) {
		try {
			await DeleteCollection(id);
			await DeleteDraftsUnderCollection(id);
			//refresh from db

			await this.initializeCollections();
			await this.initializeSavedRequests();
			this.tabSvc.refreshNotifier.next(AppTabType.Req);
		} catch (error) {
			console.error(error);
		}
	}

	public async renameCollection(id: string, name: string) {
		try {
			await RenameCollection(id, name);
			await this.initializeCollections();
		} catch (error) {
			console.error(error);
		}
	}

	public async clearCollection(id: string) {
		try {
			await ClearCollection(id);
			await DeleteDraftsUnderCollection(id);

			//refresh from db
			await this.initializeSavedRequests();
			this.tabSvc.refreshNotifier.next(AppTabType.Req);
		} catch (error) {
			console.error(error);
		}
	}

	public async exportCollection(id: string) {
		try {
			await ExportCollection(id);
		} catch (error) {
			console.error(error);
		}
	}

	public async importCollection() {
		try {
			await ImportCollection();
			await this.initializeCollections();
			await this.initializeSavedRequests();
		} catch (error) {
			console.error(error);
		}
	}

	//#endregion collections

	//#region layout
	private _formLayout = signal<FormLayout>(FormLayout.Responsive);
	private layoutChange$ = new Subject<FormLayout>();
	public formLayout = computed(() => this._formLayout());
	public setLayout(l: FormLayout) {
		this._formLayout.set(l);
		this.layoutChange$.next(l);
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

	private desktopSidebarChange$ = new Subject<boolean>();

	public setCurrentSidebarContent(contentType: AppSidebarContent) {
		this._appSidebarContent.set(contentType);
	}

	//#region desktop-sidebar
	private _isDesktopSidebarOpen = signal<boolean>(true);
	public isDesktopSidebarOpen = computed(() => this._isDesktopSidebarOpen());

	public toggleDesktopSidebar() {
		this._isDesktopSidebarOpen.update((x) => {
			this.desktopSidebarChange$.next(!x);
			return !x;
		});
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
			displayName: "Select Workspace",
		},
		{
			id: "workspace1",
			displayName: "Workspace1",
		},
		{
			id: "workspace2",
			displayName: "Workspace2",
		},
		{
			id: "workspace3",
			displayName: "Workspace3",
		},
		{
			id: "workspace4",
			displayName: "Workspace4",
		},
		{
			id: "workspace5",
			displayName: "Workspace5",
		},
		{
			id: "workspace6",
			displayName: "Workspace6",
		},
		{
			id: "workspace7",
			displayName: "Workspace7",
		},
		{
			id: "workspace8",
			displayName: "Workspace8",
		},
		{
			id: "workspace9",
			displayName: "Workspace9",
		},
		{
			id: "workspace10",
			displayName: "Workspace10",
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

		effect(() => {
			const environments = this._environments();
			const globalMap = environments.reduce((acc, curr) => {
				const { id, dataJSON } = curr;
				if (dataJSON && dataJSON.trim() !== "") {
					const parsed = JSON.parse(dataJSON) as EnvironmentItem[];
					acc[id] = parsed.reduce(
						(acc, curr) => {
							acc[curr.key] = curr.val;
							return acc;
						},
						{} as Record<string, string>,
					);
				}

				return acc;
			}, {} as GlobalEnvMap);

			this._globalEnvMap.set(globalMap);
			this.activeEnvChange$.next();
		});

		this.layoutChange$.pipe(takeUntilDestroyed(this.destoyRef)).subscribe({
			next: (v) => {
				console.log(`saving layout preference ${v} in db`);
				UpdateLayoutPreference(v);
			},
		});

		this.searchHistoryKeyChange$
			.pipe(takeUntilDestroyed(this.destoyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					this._searchHistoryKey.set(v);
				},
			});

		this.envSearchKeyChange$
			.pipe(takeUntilDestroyed(this.destoyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					this._envSearchKey.set(v);
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

		this.refreshEnvs$.pipe(takeUntilDestroyed(this.destoyRef)).subscribe({
			next: () => {
				console.log(`refreshing envs from db`);
				this.initializeEnvironments();
			},
		});

		this.collectionSearchKeyChange$
			.pipe(takeUntilDestroyed(this.destoyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					this._collectionSearchKey.set(v);
				},
			});

		this.desktopSidebarChange$
			.pipe(takeUntilDestroyed(this.destoyRef))
			.subscribe({
				next: (v) => {
					UpdateSideBarPreference(v).then(() => {
						console.log(`sidebar preference saved to db`);
					});
				},
			});

		this.discardReqDraftsDbSync$
			.pipe(takeUntilDestroyed(this.destoyRef))
			.subscribe({
				next: (v) => {
					UpdateAlwaysDiscardDraftsPreference(v).then(() => {
						console.log(`always discard drafts preference saved to db`);
					});
				},
			});

		this.discardEnvDraftsDbSync$
			.pipe(takeUntilDestroyed(this.destoyRef))
			.subscribe({
				next: (v) => {
					UpdateAlwaysDiscardEnvDraftsPreference(v).then(() => {
						console.log(`always discard env drafts preference saved to db`);
					});
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

	async initializeEnvironments() {
		try {
			const environments = await GetEnvironments();
			if (Array.isArray(environments) && environments.length) {
				this._environments.set(environments);
			} else {
				this._environments.set([]);
			}
		} catch (error) {
			console.error(error);
		}
	}

	async initializeCollections() {
		try {
			const collections = await GetAllCollections();
			if (Array.isArray(collections) && collections.length) {
				this._collections.set(collections);
			} else {
				this._collections.set([]);
			}
		} catch (_error) {
			this._appState.set("error");
		}
	}

	async initializeSavedRequests() {
		try {
			const savedRequests = await GetSavedRequests();
			if (Array.isArray(savedRequests) && savedRequests.length) {
				this._savedRequests.set(savedRequests);
			} else {
				this._savedRequests.set([]);
			}
		} catch (_error) {
			this._appState.set("error");
		}
	}

	async initializeUIState() {
		try {
			const uiState = await GetUIState();
			this._formLayout.set(
				(uiState.layout as FormLayout) || FormLayout.Responsive,
			);
			this._isDesktopSidebarOpen.set(uiState.isSidebarOpen);
			this._alwaysDiscardReqDrafts.set(uiState.alwaysDiscardDrafts);
			await this.tabSvc.init(uiState);
		} catch (_error) {
			this._appState.set("error");
		}
	}

	public async init() {
		try {
			await new Promise((resolve) => setTimeout(resolve, 1500));
			//initialize collections + saved requests
			await this.initializeCollections();
			await this.initializeSavedRequests();
			await this.initializeEnvironments();
			await this.initializeUIState();
			this._appState.set("loaded");
		} catch (_error) {
			this._appState.set("error");
		}
	}

	//#endregion init
}
