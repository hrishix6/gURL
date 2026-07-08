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
	APP_COLLECTIONS_FETCH_ENTITY,
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
	getReqMocksRepository,
	getReqRepository,
	getUIStateRepository,
	getWorkspaceRepository,
} from "@/services";
import {
	AppSidebarContent,
	type AppTheme,
	type DropDownItem,
	type EnvironmentItem,
	FormLayout,
	type GlobalEnvMap,
	type InputToken,
	type ReqHistoryItem,
} from "@/types";
import { FetchStateService } from "./fetch.state.service";
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
	private readonly reqMocksRepo = getReqMocksRepository();

	private tabSvc = inject(TabsService);
	private alertSvc = inject(AlertService);
	private destoyRef = inject(DestroyRef);
	private discardReqDraftsDbSync$ = new Subject<boolean>();
	private discardEnvDraftsDbSync$ = new Subject<boolean>();
	private activeWorkspaceDbSync$ = new Subject<string>();
	public activeEnvChange$ = new Subject<void>();
	public activeEnvDbSync$ = new Subject<string>();
	public envUpdated$ = new Subject<string>();

	public sidebarItemExpandSignal = new Subject<{
		key: string;
		open: boolean;
	}>();

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

	//#region examples

	private _savedExamples = signal<models.ReqExampleLightDTO[]>([]);

	public savedExamples = computed(() => {
		const examples = this._savedExamples();

		const key = this.searchKey();

		if (!key || key.trim() === "") {
			return examples;
		}

		const normalizedKey = key.toLocaleLowerCase();

		return examples.filter(
			(e) =>
				e.name.toLowerCase().includes(normalizedKey) ||
				e.method.toLowerCase().includes(normalizedKey) ||
				e.url.toLowerCase().includes(normalizedKey),
		);
	});

	public refreshSavedExamples$ = new Subject<void>();

	public async deleteReqExample(id: string) {
		try {
			await this.reqRepo.deleteReqExample(id);
			this.alertSvc.addAlert(`Request example deleted.`, "success");

			this._savedExamples.update((prev) => {
				return prev.filter((x) => x.id !== id);
			});

			this.tabSvc.closeExampleTab(id);
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to delete request example.`, "error");
		}
	}

	public async addReqExample(
		dto: models.ReqExampleDTO,
		meta: models.SavedResponseRenderMeta,
	) {
		await this.reqRepo.addReqExample(dto, meta);
		this._savedExamples.update((prev) => {
			return [
				{
					id: dto.id,
					name: dto.name,
					requestId: dto.requestId,
					method: dto.method,
					collectionId: dto.collectionId,
					url: dto.url,
				},
				...prev,
			];
		});
	}

	async fetchSavedExamples(collectionId: string) {
		const fKey = this.fetchStateSvc.exampleFKey(collectionId);

		try {
			const examples = await this.reqRepo.getReqExamples({
				workspaceId: this._activeWorkspace(),
				collectionId: collectionId,
			});

			if (Array.isArray(examples) && examples.length) {
				this._savedExamples.update((prev) => {
					const cpy = prev.filter((x) => x.collectionId !== collectionId);
					return [...cpy, ...examples];
				});
			}
			this.fetchStateSvc.loaded(fKey);
		} catch (_error) {
			this.fetchStateSvc.error(fKey);
		} finally {
			this.fetchStateSvc.end(fKey);
		}
	}

	//#endregion examples

	//#region environments

	public resolveVar(key: string, envId?: string): [v: string, ok: boolean] {
		if (!envId) {
			envId = this._activeEnvironment();
		}

		const env = this._globalEnvMap()[envId];

		if (!env) {
			return ["undefined", false];
		}

		if (!(key in env)) {
			return ["undefined", false];
		}

		return [env[key] || "", !!env[key]];
	}

	public validateInterpolatedToken(
		token: InputToken,
		useEnv?: string,
	): [boolean, string] {
		let envToCheck: string = "";

		if (useEnv) {
			envToCheck = useEnv;
		} else {
			const currentEnv = this.activeEnvironment();
			if (currentEnv) {
				envToCheck = currentEnv;
			}
		}

		if (!envToCheck) {
			return [false, ""];
		}

		const env = this._globalEnvMap()[envToCheck];

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

	public refreshEnvs$ = new Subject<void>();
	private _environments = signal<models.EnvironmentDTO[]>([]);
	public environments = computed(() => {
		const key = this.searchKey().toLocaleLowerCase();
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

		return [{ id: NO_ENV_ID, displayName: "None" }, ...t];
	});

	private _activeEnvironment = signal<string>(NO_ENV_ID);

	public activeEnvironment = computed(() => this._activeEnvironment());

	public setActiveEnvironment(id: string) {
		const index = this.environmentDropdownItems().findIndex((x) => x.id === id);
		if (index > -1) {
			this._activeEnvironment.set(id);
			this.activeEnvDbSync$.next(id);
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
			this.tabSvc.environmentDeleteNotifier.next(id);
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
	private _historyItems = signal<ReqHistoryItem[]>([]);

	public historyItems = computed(() => {
		const key = this.searchKey().toLocaleLowerCase();

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
			return newHistory;
		});
	}

	//#endregion history

	//#region requests
	private _savedRequests = signal<models.RequestLightDTO[]>([]);

	public savedRequests = computed(() => {
		const key = this.searchKey();

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
			this.alertSvc.addAlert(`Request deleted.`, "success");
			this.tabSvc.requestDeleteNotifier.next(requestId);
			this._savedRequests.update((prev) => {
				return prev.filter((x) => x.id !== requestId);
			});
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to delete request.`, "error");
		}
	}

	public async copyRequest(sourceId: string, name: string) {
		try {
			const copyId = await this.reqRepo.saveRequestCopy(sourceId, { name });
			const copy = await this.reqRepo.getSavedReqById(copyId);
			if (!copy) {
				this.alertSvc.addAlert(`Failed to fetch copy`, "success");
				return;
			}
			this._savedRequests.update((prev) => {
				return [copy, ...prev];
			});
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to copy request "${name}".`, "error");
		}
	}

	public async fetchUpdatedReq(id: string) {
		try {
			const r = await this.reqRepo.getSavedReqById(id);

			if (!r) {
				throw new Error("failed to fetch update");
			}

			this._savedRequests.update((prev) => {
				const cpy = prev.filter((x) => x.id !== id);
				return [r, ...cpy];
			});
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert("failed to fetch updated request", "error");
		}
	}

	async fetchSavedRequests(collectionId: string) {
		const fKey = this.fetchStateSvc.requestsFKey(collectionId);

		try {
			const requests = await this.reqRepo.getSavedRequests({
				workspaceId: this._activeWorkspace(),
				collectionId: collectionId,
			});

			if (Array.isArray(requests) && requests.length) {
				this._savedRequests.update((prev) => {
					const cpy = prev.filter((x) => x.collectionId !== collectionId);
					return [...cpy, ...requests];
				});
			}
			this.fetchStateSvc.loaded(fKey);
		} catch (_error) {
			this.fetchStateSvc.error(fKey);
		} finally {
			this.fetchStateSvc.end(fKey);
		}
	}

	//#endregion requests

	//#region collections
	private _collections = signal<models.CollectionDTO[]>([]);
	public collections = computed(() => this._collections());

	public async addCollection(name: string) {
		try {
			const newCollection: models.CreateCollectionDTO = {
				id: nanoid(),
				name,
				workspaceId: this._activeWorkspace(),
			};
			await this.collectionRepo.addCollection(newCollection);

			this._collections.update((prev) => {
				return [
					{
						id: newCollection.id,
						name: newCollection.name,
						mockServerEnabled: false,
						mockServerKey: "",
					},
					...prev,
				];
			});
			this.alertSvc.addAlert(`Collection ${name} added`, "success");
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to add collection ${name}`, "error");
		}
	}

	public async deleteCollection(id: string) {
		try {
			await this.collectionRepo.deleteCollection(id);
			this._collections.update((prev) => {
				return prev.filter((x) => x.id !== id);
			});

			this._savedRequests.update((x) => {
				return x.filter((y) => y.collectionId !== id);
			});

			this._savedExamples.update((x) => {
				return x.filter((y) => y.collectionId !== id);
			});

			this._mockItems.update((x) => {
				return x.filter((y) => y.collectionId !== id);
			});

			this.tabSvc.collectionDeleteNotifier.next(id);
			this.alertSvc.addAlert(`Collection deleted.`, "success");
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to delete collection.`, "error");
		}
	}

	public async renameCollection(id: string, name: string) {
		try {
			await this.collectionRepo.renameCollection(id, name);
			this.alertSvc.addAlert(`Collection renamed to ${name}.`, "success");
			this._collections.update((prev) => {
				const i = prev.findIndex((x) => x.id === id);

				if (i < 0) {
					return prev;
				}

				const cpy = [...prev];
				cpy[i] = { ...cpy[i], name };
				return cpy;
			});
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to rename collection.`, "error");
		}
	}

	public async clearCollection(id: string) {
		try {
			await this.collectionRepo.clearCollection(id);
			this.alertSvc.addAlert(`Collection cleared.`, "success");
			this._savedRequests.update((x) => x.filter((y) => y.collectionId !== id));
			this.tabSvc.clearCollectionNotifier.next(id);
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
			const importedId = await this.exporter.importCollection(
				this._activeWorkspace(),
				file,
			);
			const collection =
				await this.collectionRepo.getCollectionById(importedId);
			if (!collection) {
				throw new Error("no collection received");
			}
			this._collections.update((prev) => [collection, ...prev]);
			this.alertSvc.addAlert(`Collection imported successfully.`, "success");
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to import collection.`, "error");
		}
	}

	async fetchCollections() {
		try {
			this.fetchStateSvc.start(APP_COLLECTIONS_FETCH_ENTITY);
			const collections = await this.collectionRepo.getAllCollections({
				workspaceId: this._activeWorkspace(),
			});

			if (Array.isArray(collections) && collections.length) {
				this._collections.set(collections);
			} else {
				this._collections.set([]);
			}
			this.fetchStateSvc.loaded(APP_COLLECTIONS_FETCH_ENTITY);
		} catch (_error) {
			this.fetchStateSvc.error(APP_COLLECTIONS_FETCH_ENTITY);
		} finally {
			this.fetchStateSvc.end(APP_COLLECTIONS_FETCH_ENTITY);
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

	private themeDbSync$ = new Subject<AppTheme>();

	private isAppTheme(theme: unknown): theme is AppTheme {
		return SUPPORTED_THEMES.some((x) => x.id === theme);
	}

	public setActiveTheme(theme: AppTheme) {
		this._activeTheme.set(theme);
		this.themeDbSync$.next(theme);
	}
	//#endregion theme

	//#region console
	private _isConsoleOpen = signal<boolean>(false);
	public isConsoleOpen = computed(() => this._isConsoleOpen());

	public toggleConsole() {
		this._isConsoleOpen.update((x) => !x);
	}
	//#endregion console

	//#region sidebar
	private searchKey = signal<string>("");

	public searchKeyChanges$ = new Subject<string>();

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

	public setActiveWorkspace(id: string) {
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

			await this.uiStateRepo.updateUIState({
				activeWorkspace: id,
			});

			this.clean();

			window.location.href = `/`;
		} catch (error) {
			console.error(error);
		}
	}

	async createDefaultWorkspace(name: string): Promise<string> {
		const newWorkspace: models.CreateWorkspaceDTO = {
			name,
			id: nanoid(),
		};
		await this.workspaceRepo.addWorkspace(newWorkspace);
		// await this.initializeWorkspaces(newWorkspace.id);
		await this.uiStateRepo.updateUIState({
			activeWorkspace: newWorkspace.id,
		});

		const uiState = await this.uiStateRepo.getUIState();
		const workspaces = await this.workspaceRepo.getWorkspaces();

		if (
			uiState?.activeWorkspace &&
			Array.isArray(workspaces) &&
			workspaces.length
		) {
			this.initUiState(uiState);
			this.setWorkspaces(workspaces);
			this.setActiveWorkspace(uiState.activeWorkspace);
			return uiState.activeWorkspace;
		}

		throw new Error("failed to initialize default workspaces");
	}

	setWorkspaces(data: models.WorkspaceLightDTO[]) {
		const workspaceDropdownItems = data.map((ws) => ({
			id: ws.id,
			displayName: ws.name,
		}));
		this._workspaces.set(workspaceDropdownItems);
	}

	async createNewWorkspace(name: string) {
		try {
			const newWorkspace: models.CreateWorkspaceDTO = {
				name,
				id: nanoid(),
			};
			await this.workspaceRepo.addWorkspace(newWorkspace);

			this._workspaces.update((prev) => {
				return [
					...prev,
					{
						id: newWorkspace.id,
						displayName: name,
					},
				];
			});
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to create workspace '${name}'`, "error");
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

		this.activeEnvDbSync$.pipe(takeUntilDestroyed(this.destoyRef)).subscribe({
			next: (v) => {
				this.workspaceRepo
					.updateWorkspace(this._activeWorkspace(), {
						activeEnv: v,
					})
					.then(() => {
						console.log(`updated active env to ${v} for workspace`);
					})
					.catch(() => {
						console.log(`failed to update active env ${v} in db`);
					});
			},
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

		this.themeDbSync$.pipe(takeUntilDestroyed(this.destoyRef)).subscribe({
			next: (v) => {
				this.uiStateRepo
					.updateUIState({
						activeTheme: v,
					})
					.then(() => {
						console.log(`updated theme to ${v} in db`);
					});
			},
		});

		this.searchKeyChanges$
			.pipe(takeUntilDestroyed(this.destoyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					this.searchKey.set(v);
				},
			});

		this.refreshEnvs$.pipe(takeUntilDestroyed(this.destoyRef)).subscribe({
			next: () => {
				console.log(`refreshing envs from db`);
				this.initializeEnvironments();
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
			const environments = await this.envRepo.getEnvironments({
				workspaceId: this._activeWorkspace(),
			});
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

	public initUiState(data: models.UIStateDTO) {
		if (this.isAppTheme(data.activeTheme)) {
			this._activeTheme.set(data.activeTheme);
		}
		this._formLayout.set((data.layout as FormLayout) || FormLayout.Responsive);
		this._isDesktopSidebarOpen.set(data.isSidebarOpen);
		this._alwaysDiscardReqDrafts.set(data.alwaysDiscardDrafts);
	}

	public async initializeActiveWorkspace(workspaceData: models.WorkspaceDTO) {
		await this.initializeEnvironments();
		if (this._environments().some((x) => x.id === workspaceData.activeEnv)) {
			this._activeEnvironment.set(workspaceData.activeEnv);
		} else {
			this._activeEnvironment.set(NO_ENV_ID);
		}

		this.tabSvc.init(workspaceData);
	}

	public clean() {
		this.searchKey.set("");

		// history
		this._historyItems.set([]);

		// environments
		this._environments.set([]);

		this._activeEnvironment.set(NO_ENV_ID);

		// workspaces
		this._workspaces.set([]);
		this._activeWorkspace.set("");

		// requests
		this._savedRequests.set([]);
		this._savedExamples.set([]);

		// collections
		this._collections.set([]);

		this.tabSvc.clean();
	}

	//#endregion init

	//#region mocks
	private fetchStateSvc = inject(FetchStateService);

	private _mockItems = signal<models.MockLightDTO[]>([]);

	public mockItems = computed(() => {
		const key = this.searchKey();

		if (!key || key.trim() === "") {
			return this._mockItems();
		}

		const normalizedKey = key.toLocaleLowerCase();

		return this._mockItems().filter(
			(mock) =>
				mock.method.toLocaleLowerCase().includes(normalizedKey) ||
				mock.name?.toLocaleLowerCase().includes(normalizedKey) ||
				mock.path?.toLocaleLowerCase().includes(normalizedKey),
		);
	});

	public async fetchMockItems(collectionId: string) {
		const key = this.fetchStateSvc.mocksKey(collectionId);
		try {
			this.fetchStateSvc.start(key);

			const mocks = await this.reqMocksRepo.getMocks({
				collectionId: collectionId,
				workspaceId: this._activeWorkspace(),
			});

			if (Array.isArray(mocks) && mocks.length) {
				this._mockItems.update((prev) => {
					const cpy = prev.filter((x) => x.collectionId !== collectionId);
					return [...cpy, ...mocks];
				});
			}

			this.fetchStateSvc.loaded(key);
		} catch (_error) {
			this.fetchStateSvc.error(key);
		} finally {
			this.fetchStateSvc.end(key);
		}
	}

	public async copyMock(id: string) {
		try {
			const newMock = await this.reqMocksRepo.copyMockWithId(id);
			this._mockItems.update((prev) => {
				return [...prev, newMock];
			});
			this.alertSvc.addAlert("Copy successful", "success");
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert("Failed to copy mock", "error");
		}
	}

	public async deleteMock(id: string) {
		try {
			await this.reqMocksRepo.deleteMockById(id);
			this._mockItems.update((prev) => {
				return prev.filter((x) => x.id !== id);
			});
			this.tabSvc.mockDeleteNotifier.next(id);
			this.alertSvc.addAlert("Mock deleted", "success");
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert("Failed to delete mock", "error");
		}
	}

	public async fetchUpdatedMock(id: string) {
		try {
			const m = await this.reqMocksRepo.getMockById(id);

			if (!m) {
				throw new Error("failed to fetch update");
			}

			this._mockItems.update((prev) => {
				const cpy = prev.filter((x) => x.id !== id);
				return [m, ...cpy];
			});
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert("failed to fetch updated mock", "error");
		}
	}

	public async createMockFroMExample(exampleId: string) {
		try {
			const mock = await this.reqRepo.createMockFromExample(exampleId, {
				id: nanoid(),
			});

			this._mockItems.update((prev) => [mock, ...prev]);
			this.alertSvc.addAlert("Mock created", "success");
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert("failed to create mock", "error");
		}
	}

	public async createMockServer(id: string) {
		try {
			const updated = await this.collectionRepo.createMockServer({
				collectionId: id,
				workspaceId: this._activeWorkspace(),
			});

			this._collections.update((prev) => {
				const i = prev.findIndex((x) => x.id === id);

				if (i < 0) {
					return prev;
				}

				const cpy = [...prev];
				cpy[i] = updated;
				return cpy;
			});

			this.alertSvc.addAlert("Mock server created", "success");
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert("failed to create mock server", "error");
		}
	}

	public async updateMockServer(id: string, flag: boolean) {
		try {
			const updated = await this.collectionRepo.updateMockServer(id, flag);

			this._collections.update((prev) => {
				const i = prev.findIndex((x) => x.id === id);

				if (i < 0) {
					return prev;
				}

				const cpy = [...prev];
				cpy[i] = updated;
				return cpy;
			});

			this.alertSvc.addAlert(
				`Mock server ${flag ? "started" : "stoppped"}.`,
				"success",
			);
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(
				`failed to ${flag ? "start" : "stop"} mock server`,
				"error",
			);
		}
	}
	//#endregion mocks
}
