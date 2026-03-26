import {
	computed,
	DestroyRef,
	effect,
	Injectable,
	inject,
	signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { models } from "@wailsjs/go/models";
import { nanoid } from "nanoid";
import { debounceTime, Subject } from "rxjs";
import {
	DEFAULT_THEME,
	NO_ENV_ID,
	SUPPORTED_THEMES,
	THEME_LOCALSTORAGE_KEY,
} from "@/constants";
import {
	AlertService,
	getCollectionRepository,
	getEnvRepository,
	getExporter,
	getReqRepository,
	getUIStateRepository,
	getWorkspaceRepository,
} from "@/services";
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
	private readonly reqRepo = getReqRepository();
	private readonly collectionRepo = getCollectionRepository();
	private readonly envRepo = getEnvRepository();
	private readonly uiStateRepo = getUIStateRepository();
	private readonly workspaceRepo = getWorkspaceRepository();
	private readonly exporter = getExporter();
	private _appState = signal<AppState>("initializing");
	private _appError = signal<string | null>(null);
	public appState = computed(() => this._appState());
	public appError = computed(() => this._appError());
	private tabSvc = inject(TabsService);
	private alertSvc = inject(AlertService);
	private destoyRef = inject(DestroyRef);
	private discardReqDraftsDbSync$ = new Subject<boolean>();
	private discardEnvDraftsDbSync$ = new Subject<boolean>();
	private activeWorkspaceDbSync$ = new Subject<string>();
	public activeEnvChange$ = new Subject<void>();
	public refreshBreadcrumb$ = new Subject<void>();
	public initiateDefaultWorkspaceCreation$ = new Subject<void>();

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

	private _savedExamples = signal<models.ReqExampleLightDTO[]>([]);
	public savedExamples = computed(() => this._savedExamples());
	public refreshSavedExamples$ = new Subject<void>();

	public async deleteReqExample(id: string) {
		try {
			await this.reqRepo.deleteReqExample(id);
			this.alertSvc.addAlert(`Request example deleted.`, "success");
			await this.initializeSavedExamples();
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to delete request example.`, "error");
		}
	}

	//#region environments
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
			if (this._activeEnvironment() === id) {
				this._activeEnvironment.set(NO_ENV_ID);
			}
			await this.envRepo.removeEnv(id);
			await this.envRepo.deleteEnvDraftsUnderEnv(id);
			this.alertSvc.addAlert(`Environment deleted.`, "success");
			await this.initializeEnvironments();
			this.tabSvc.refreshNotifier.next(AppTabType.Env);
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to delete environment.`, "error");
		}
	}

	public async copyEnvironment(dto: models.EnvironmentDTO) {
		try {
			const copiedEnvId = nanoid();

			await this.envRepo.copyEnvironment(dto.id, {
				id: copiedEnvId,
			});

			this.alertSvc.addAlert(
				`Environment copy ${dto.name}-copy added.`,
				"success",
			);

			await this.initializeEnvironments();

			this.tabSvc.createEnvTabFromSaved({
				dataJSON: "",
				id: copiedEnvId,
				name: `${dto.name}-copy`,
			});
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(
				`Failed to copy environment ${dto.name}.`,
				"error",
			);
		}
	}

	public async importEnvironment(file?: File) {
		try {
			await this.exporter.importEnvironment(this._activeWorkspace(), file);
			this.alertSvc.addAlert(`Environment imported successfully.`, "success");
			await this.initializeEnvironments();
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to import environment.`, "error");
		}
	}

	public async exportEnvironment(id: string, name: string) {
		try {
			await this.exporter.exportEnvironment(id, name);
			this.alertSvc.addAlert(`Environment exported successfully.`, "success");
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to export environment.`, "error");
		}
	}

	//#endregion environments

	//#region history
	private globalHistory: Record<string, ReqHistoryItem[]> = {};
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
			const newHistory = [...prev, item];
			this.globalHistory[this._activeWorkspace()] = newHistory;
			return newHistory;
		});
	}

	//#endregion history

	//#region requests
	public refreshSavedRequests$ = new Subject<void>();
	private _savedRequests = signal<models.RequestLightDTO[]>([]);
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
			await this.reqRepo.deleteSavedReq(requestId);
			await this.reqRepo.deleteRequestDrafts(requestId);
			this.alertSvc.addAlert(`Request deleted.`, "success");
			await this.initializeSavedRequests();
			this.tabSvc.refreshNotifier.next(AppTabType.Req);
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to delete request.`, "error");
		}
	}

	public async copyRequest(sourceId: string, name: string) {
		try {
			await this.reqRepo.saveRequestCopy(sourceId, { id: nanoid(), name });
			this.alertSvc.addAlert(`Request copy "${name}" added.`, "success");
			await this.initializeSavedRequests();
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to copy request "${name}".`, "error");
		}
	}

	//#endregion requests

	//#region collections
	public collectionSearchKeyChange$ = new Subject<string>();
	private _collections = signal<models.CollectionDTO[]>([]);
	private _collectionSearchKey = signal<string>("");
	public collections = computed(() => this._collections());

	public async addCollection(name: string) {
		try {
			const newCollection: models.CreateCollectionDTO = {
				id: nanoid(),
				name,
				workspaceId: this._activeWorkspace(),
			};
			await this.collectionRepo.addCollection(newCollection);
			this.alertSvc.addAlert(`Collection ${name} added`, "success");
			await this.initializeCollections();
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to add collection ${name}`, "error");
		}
	}

	public async deleteCollection(id: string) {
		try {
			await this.collectionRepo.deleteCollection(id);
			await this.collectionRepo.deleteDraftsUnderCollection(id);
			this.alertSvc.addAlert(`Collection deleted.`, "success");
			await this.initializeCollections();
			await this.initializeSavedRequests();
			this.tabSvc.refreshNotifier.next(AppTabType.Req);
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to delete collection.`, "error");
		}
	}

	public async renameCollection(id: string, name: string) {
		try {
			await this.collectionRepo.renameCollection(id, name);
			this.alertSvc.addAlert(`Collection renamed to ${name}.`, "success");
			await this.initializeCollections();
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to rename collection.`, "error");
		}
	}

	public async clearCollection(id: string) {
		try {
			await this.collectionRepo.clearCollection(id);
			await this.collectionRepo.deleteDraftsUnderCollection(id);
			this.alertSvc.addAlert(`Collection cleared.`, "success");
			await this.initializeSavedRequests();
			this.tabSvc.refreshNotifier.next(AppTabType.Req);
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to clear collection.`, "error");
		}
	}

	public async exportCollection(id: string, name: string) {
		try {
			await this.exporter.exportCollection(id, name);
			this.alertSvc.addAlert(`Collection exported successfully.`, "success");
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to export collection.`, "error");
		}
	}

	public async importCollection(file?: File) {
		try {
			await this.exporter.importCollection(this._activeWorkspace(), file);
			this.alertSvc.addAlert(`Collection imported successfully.`, "success");
			await this.initializeCollections();
			await this.initializeSavedRequests();
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to import collection.`, "error");
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
	private _workspaces = signal<DropDownItem<string>[]>([]);

	private _activeWorkspace = signal<string>("");

	public activeWorkSpace = computed<DropDownItem<string>>(() => {
		const id = this._activeWorkspace();
		return this._workspaces().find((x) => x.id === id)!;
	});

	public workspaces = computed(() => this._workspaces());

	private setActiveWorkspace(id: string) {
		const index = this._workspaces().findIndex((x) => x.id === id);
		if (index === -1) {
			throw new Error("Workspace with the given id does not exist");
		}
		this.activeWorkspaceDbSync$.next(id);
		this.tabSvc.setWorkspaceId(id);
		this._activeWorkspace.set(id);
	}

	public async switchworkspace(id: string) {
		try {
			if (id === this.activeWorkSpace().id) {
				return;
			}

			this._appState.set("initializing");
			await new Promise((resolve) => setTimeout(resolve, 1000));
			await this.initializeActiveWorkspace(id);
			this.alertSvc.addAlert(`Workspace initialized`, "success");
			this._appState.set("loaded");
		} catch (error) {
			console.error(error);
			this._appError.set("Failed to switch workspace, please reload.");
			this._appState.set("error");
		}
	}

	async createDefaultWorkspace(name: string) {
		try {
			const newWorkspace: models.CreateWorkspaceDTO = {
				name,
				id: nanoid(),
			};
			await this.workspaceRepo.addWorkspace(newWorkspace);
			await this.initializeWorkspaces(newWorkspace.id);
		} catch (error) {
			console.error(error);
			this._appError.set("Failed to create default workspace.");
			this._appState.set("error");
		}
	}

	async refreshWorkspaces() {
		const workspaces = await this.workspaceRepo.getWorkspaces();
		if (Array.isArray(workspaces) && workspaces.length) {
			const workspaceDropdownItems = workspaces.map((ws) => ({
				id: ws.id,
				displayName: ws.name,
			}));

			this._workspaces.set(workspaceDropdownItems);
		}
	}

	async createNewWorkspace(name: string) {
		try {
			const newWorkspace: models.CreateWorkspaceDTO = {
				name,
				id: nanoid(),
			};
			await this.workspaceRepo.addWorkspace(newWorkspace);
			await this.refreshWorkspaces();
		} catch (error) {
			console.error(error);
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
				this.uiStateRepo
					.updateUIState({
						layout: v,
					})
					.then(() => {
						console.log(`updated layout to ${v} in db`);
					});
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

		this.refreshSavedExamples$
			.pipe(takeUntilDestroyed(this.destoyRef))
			.subscribe({
				next: () => {
					console.log(`refreshing saved examples from db`);
					this.initializeSavedExamples();
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
					this.uiStateRepo
						.updateUIState({
							isSidebarOpen: v,
						})
						.then(() => {
							console.log(
								`sidebar preference ${v ? "open" : "closed"} saved to db`,
							);
						});
				},
			});

		this.discardReqDraftsDbSync$
			.pipe(takeUntilDestroyed(this.destoyRef))
			.subscribe({
				next: (v) => {
					this.uiStateRepo
						.updateUIState({
							alwaysDiscardReqDrafts: v,
						})
						.then(() => {
							console.log(
								`always discard req drafts: ${v ? "yes" : "no"}, saved to db`,
							);
						});
				},
			});

		this.discardEnvDraftsDbSync$
			.pipe(takeUntilDestroyed(this.destoyRef))
			.subscribe({
				next: (v) => {
					this.uiStateRepo
						.updateUIState({
							alwaysDiscardEnvDrafts: v,
						})
						.then(() => {
							console.log(
								`always discard env drafts: ${v ? "yes" : "no"}, saved to db`,
							);
						});
				},
			});

		this.activeWorkspaceDbSync$
			.pipe(takeUntilDestroyed(this.destoyRef))
			.subscribe({
				next: (v) => {
					this.uiStateRepo
						.updateUIState({
							activeWorkspace: v,
						})
						.then(() => {
							console.log(`active workspace ${v} saved to db`);
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
			const environments = await this.envRepo.getEnvironments(
				this._activeWorkspace(),
			);
			if (Array.isArray(environments) && environments.length) {
				this._environments.set(environments);
			} else {
				this._environments.set([]);
			}
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert("Failed to load environments.", "error");
		}
	}

	async initializeCollections() {
		try {
			const collections = await this.collectionRepo.getAllCollections(
				this._activeWorkspace(),
			);
			if (Array.isArray(collections) && collections.length) {
				this._collections.set(collections);
			} else {
				this._collections.set([]);
			}
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert("Failed to load collections.", "error");
		}
	}

	async initializeSavedRequests() {
		try {
			const savedRequests = await this.reqRepo.getSavedRequests(
				this._activeWorkspace(),
			);
			if (Array.isArray(savedRequests) && savedRequests.length) {
				this._savedRequests.set(savedRequests);
			} else {
				this._savedRequests.set([]);
			}
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert("Failed to load requests.", "error");
		}
	}

	async initializeSavedExamples() {
		try {
			const savedExamples = await this.reqRepo.getReqExamples(
				this._activeWorkspace(),
			);
			if (Array.isArray(savedExamples) && savedExamples.length) {
				this._savedExamples.set(savedExamples);
			} else {
				this._savedExamples.set([]);
			}
		} catch (_error) {
			this.alertSvc.addAlert("Failed to load request examples.", "error");
		}
	}

	async initializeUIState(): Promise<string> {
		this.initializeAppPreferences();
		const uiState = await this.uiStateRepo.getUIState();
		this._formLayout.set(
			(uiState.layout as FormLayout) || FormLayout.Responsive,
		);
		this._isDesktopSidebarOpen.set(uiState.isSidebarOpen);
		this._alwaysDiscardReqDrafts.set(uiState.alwaysDiscardDrafts);
		return uiState.activeWorkspace;
	}

	async initializeWorkspaces(activeWorkspace: string) {
		await this.refreshWorkspaces();
		if (activeWorkspace !== "") {
			await this.initializeActiveWorkspace(activeWorkspace);
			return;
		}

		this.initiateDefaultWorkspaceCreation$.next();
	}

	public async initializeActiveWorkspace(workspaceId: string) {
		this.setActiveWorkspace(workspaceId);
		if (this.globalHistory[workspaceId]) {
			this._historyItems.set(this.globalHistory[workspaceId]);
		} else {
			this._historyItems.set([]);
		}
		this._activeEnvironment.set(NO_ENV_ID);
		await this.initializeCollections();
		await this.initializeSavedRequests();
		await this.initializeSavedExamples();
		await this.initializeEnvironments();
		await this.tabSvc.init(workspaceId);
	}

	public async init() {
		try {
			const activeWorkspace = await this.initializeUIState();
			await this.initializeWorkspaces(activeWorkspace);
			this._appState.set("loaded");
			this.alertSvc.addAlert("App initialized.", "success");
		} catch (_error) {
			console.log(_error);
			this._appError.set("Failed to initialize the workspace.");
			this._appState.set("error");
		}
	}

	//#endregion init
}
