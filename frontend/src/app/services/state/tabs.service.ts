import {
	computed,
	DestroyRef,
	Injectable,
	inject,
	signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { models } from "@wailsjs/go/models";
import { nanoid } from "nanoid";
import { debounceTime, Subject } from "rxjs";
import {
	AlertService,
	getEnvRepository,
	getReqMocksRepository,
	getReqRepository,
	getWorkspaceRepository,
} from "@/services";
import {
	type ApplicationTab,
	AppTabType,
	type Crumb,
	type CrumbInfo,
	CrumbType,
	type ReqHistoryItem,
} from "@/types";

@Injectable({
	providedIn: "root",
})
export class TabsService {
	private reqRepo = getReqRepository();
	private mockRepo = getReqMocksRepository();
	private alertSvc = inject(AlertService);
	private envRepo = getEnvRepository();
	private workspaceRepo = getWorkspaceRepository();
	private _openTabs = signal<ApplicationTab[]>([]);
	private _activeTab = signal<string | null>("");
	public openTabs = computed(() => this._openTabs());
	public activeTab = computed(() => this._activeTab());
	public destoyRef = inject(DestroyRef);
	private tabChanges$ = new Subject<ApplicationTab[]>();
	public activeTabChanges$ = new Subject<string>();
	private reqDraftDeleted$ = new Subject<string>();
	private envDraftDeleted$ = new Subject<string>();
	private mockDraftDeleted$ = new Subject<string>();
	public tabCount = computed(() => this._openTabs().length);
	public closeReqTabEvent$ = new Subject<ApplicationTab>();
	public closeMockTabEvent$ = new Subject<ApplicationTab>();
	public closeEnvTabEvent$ = new Subject<ApplicationTab>();
	public collectionDeleteNotifier = new Subject<string>();
	public clearCollectionNotifier = new Subject<string>();
	public requestDeleteNotifier = new Subject<string>();
	public mockDeleteNotifier = new Subject<string>();
	public environmentDeleteNotifier = new Subject<string>();

	private _workspaceId = signal<string>("");

	public setWorkspaceId(id: string) {
		this._workspaceId.set(id);
	}

	//#region bread-crumbs

	private _crumbs = signal<Crumb[]>([]);
	public crumbs = computed(() => this._crumbs());

	private getReqCrumbs(crumbInfo: CrumbInfo) {
		const crumbs: Crumb[] = [];

		if (crumbInfo.collection) {
			crumbs.push({
				name: crumbInfo.collection,
				type: CrumbType.Collections,
			});
		}

		if (crumbInfo.request) {
			crumbs.push({
				name: crumbInfo.request,
				type: CrumbType.Req,
			});
		}

		//orphan req draft
		if (!crumbs.length) {
			crumbs.push({
				type: CrumbType.Req,
				name: crumbInfo.entityName,
			});
		}

		return crumbs;
	}

	private getEnvCrumbs(crumbInfo: CrumbInfo) {
		return [
			{
				name: crumbInfo.entityName,
				type: CrumbType.Env,
			},
		];
	}

	private getReqExampleCrumbs(crumbInfo: CrumbInfo) {
		const crumbs: Crumb[] = [];

		if (crumbInfo.collection) {
			crumbs.push({
				name: crumbInfo.collection,
				type: CrumbType.Collections,
			});
		}

		if (crumbInfo.request) {
			crumbs.push({
				name: crumbInfo.request,
				type: CrumbType.Req,
			});
		}

		crumbs.push({
			name: crumbInfo.entityName,
			type: CrumbType.ReqExample,
		});

		return crumbs;
	}

	private getMockCrumbs(crumbInfo: CrumbInfo) {
		const crumbs: Crumb[] = [];

		if (crumbInfo.mockServer) {
			crumbs.push({
				name: crumbInfo.mockServer,
				type: CrumbType.MockServer,
			});
		}

		crumbs.push({
			type: CrumbType.Mock,
			name: crumbInfo.entityName,
		});

		return crumbs;
	}

	public setCrumbs(crumbInfo: CrumbInfo, tabType: AppTabType) {
		switch (tabType) {
			case AppTabType.Env: {
				this._crumbs.set(this.getEnvCrumbs(crumbInfo));
				break;
			}
			case AppTabType.Req: {
				this._crumbs.set(this.getReqCrumbs(crumbInfo));
				break;
			}
			case AppTabType.ReqExample: {
				this._crumbs.set(this.getReqExampleCrumbs(crumbInfo));
				break;
			}
			case AppTabType.Mock: {
				this._crumbs.set(this.getMockCrumbs(crumbInfo));
				break;
			}
			default: {
				this._crumbs.set([]);
				break;
			}
		}
	}

	//#endregion bread-crumbs

	constructor() {
		this.tabChanges$
			.pipe(takeUntilDestroyed(this.destoyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					this.workspaceRepo
						.updateWorkspace(this._workspaceId(), {
							openTabsJSON: JSON.stringify(v),
						})
						.then(() => {
							console.log(`updated tabs state in sqlite`);
						})
						.catch((err) => {
							console.error(err);
						});
				},
			});

		this.reqDraftDeleted$.pipe(takeUntilDestroyed(this.destoyRef)).subscribe({
			next: (v) => {
				this.reqRepo
					.removeDraft(v)
					.then(() => {
						console.log(`request with id ${v} is deleted from db`);
					})
					.catch((_err) => {
						console.log(`failed to delete request with id ${v} from db`);
					});
			},
		});

		this.envDraftDeleted$.pipe(takeUntilDestroyed(this.destoyRef)).subscribe({
			next: (v) => {
				this.envRepo
					.removeEnvDraft(v)
					.then(() => {
						console.log(`env draft with id ${v} is deleted from db`);
					})
					.catch((_err) => {
						console.log(`failed to delete env draft with id ${v} from db`);
					});
			},
		});

		this.mockDraftDeleted$.pipe(takeUntilDestroyed(this.destoyRef)).subscribe({
			next: (v) => {
				this.mockRepo
					.deleteMockDraftById(v)
					.then(() => {
						console.log(`mock draft with id ${v} is deleted from db`);
					})
					.catch((_err) => {
						console.log(`failed to delete mock draft with id ${v} from db`);
					});
			},
		});

		this.activeTabChanges$.pipe(takeUntilDestroyed(this.destoyRef)).subscribe({
			next: (v) => {
				this.workspaceRepo
					.updateWorkspace(this._workspaceId(), { activeTab: v })
					.then(() => {
						console.log(`saving tab ${v} as active in db`);
					});
			},
		});
	}

	public async createFreshEnvTab() {
		try {
			const newTab: ApplicationTab = {
				id: nanoid(),
				name: "New Environment",
				tag: "ENV",
				entityId: nanoid(),
				entityType: AppTabType.Env,
				isModified: false,
			};

			await this.envRepo.addFreshEnvDraft({
				id: newTab.entityId,
				workspaceId: this._workspaceId(),
			});

			this._openTabs.update((prev) => {
				const copy = [...prev, newTab];
				this.tabChanges$.next(copy);
				return copy;
			});

			this.setActiveTab(newTab.id);
		} catch (_error) {
			console.error(_error);
			this.alertSvc.addAlert("Failed to open new environment tab", "error");
		}
	}

	public async openReqExampleTab(item: models.ReqExampleLightDTO) {
		try {
			const exists = this._openTabs().find(
				(x) => x.entityType === AppTabType.ReqExample && x.entityId === item.id,
			);

			if (exists) {
				this.setActiveTab(exists.id);
				return;
			}

			const newTab: ApplicationTab = {
				id: nanoid(),
				name: item.name,
				tag: item.method,
				entityId: item.id,
				entityType: AppTabType.ReqExample,
				isModified: false,
			};

			this._openTabs.update((prev) => {
				const copy = [...prev, newTab];
				this.tabChanges$.next(copy);
				return copy;
			});

			this.setActiveTab(newTab.id);
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert("Failed to open request example", "error");
		}
	}

	public async createEnvTabFromSaved(item: models.EnvironmentDTO) {
		try {
			const newTab: ApplicationTab = {
				id: nanoid(),
				name: item.name,
				tag: "ENV",
				entityId: nanoid(),
				entityType: AppTabType.Env,
				isModified: false,
			};

			await this.envRepo.addEnvironmentDraft({
				draftId: newTab.entityId,
				envId: item.id,
				workspaceId: this._workspaceId(),
			});

			this._openTabs.update((prev) => {
				const copy = [...prev, newTab];
				this.tabChanges$.next(copy);
				return copy;
			});

			this.setActiveTab(newTab.id);
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert("Failed to open saved environment", "error");
		}
	}

	public async createTabFromSaved(item: models.RequestLightDTO) {
		try {
			const newDraft: models.AddDraftDTO = {
				id: nanoid(),
				workspace_id: this._workspaceId(),
			};
			console.dir(newDraft);

			await this.reqRepo.addDraftFromRequest(item.id, newDraft);

			const newTab: ApplicationTab = {
				id: nanoid(),
				name: item.name,
				tag: item.method,
				entityId: newDraft.id,
				entityType: AppTabType.Req,
				isModified: false,
			};

			this._openTabs.update((prev) => {
				const copy = [...prev, newTab];
				this.tabChanges$.next(copy);
				return copy;
			});

			this.setActiveTab(newTab.id);
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert("Failed to open saved request", "error");
		}
	}

	public async createDuplicateTab(newDraft: models.RequestDraftDTO) {
		try {
			await this.reqRepo.addDraft(newDraft);

			const newTab: ApplicationTab = {
				id: nanoid(),
				name: newDraft.url || "New Request",
				tag: newDraft.method,
				entityId: newDraft.id,
				entityType: AppTabType.Req,
				isModified: false,
			};

			this._openTabs.update((prev) => {
				const copy = [...prev, newTab];
				this.tabChanges$.next(copy);
				return copy;
			});

			this.setActiveTab(newTab.id);
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert("Failed to copy tab", "error");
		}
	}

	public async createTabFromHistory(item: ReqHistoryItem) {
		try {
			const newDraft: Partial<models.RequestDraftDTO> = {
				id: nanoid(),
				url: item.url,
				method: item.method,
				parentRequestId: "",
				parentRequestName: "",
				parentCollectionId: "",
				query: JSON.stringify(item.queryParams),
				path: JSON.stringify(item.path),
				cookies: JSON.stringify(item.cookies),
				bodyType: item.bodyType,
				headers: JSON.stringify(item.headers),
				binary: item.binaryBody ? JSON.stringify(item.binaryBody) : "",
				multipart: JSON.stringify(item.multiPartBody),
				text: item.textBody,
				urlencoded: JSON.stringify(item.urlEncodedBody),
				authEnabled: item.authEnabled,
				authType: item.authType || "no_auth",
				basicAuth: item.basicAuth ? JSON.stringify(item.basicAuth) : "",
				apiKeyAuth: item.apiKeyAuth ? JSON.stringify(item.apiKeyAuth) : "",
				tokenAuth: item.tokenAuth ? JSON.stringify(item.tokenAuth) : "",
				workspace_id: this._workspaceId(),
			};

			await this.reqRepo.addDraft(newDraft as models.RequestDraftDTO);

			const newTab: ApplicationTab = {
				id: nanoid(),
				name: item.url,
				tag: item.method,
				entityId: newDraft.id!,
				entityType: AppTabType.Req,
				isModified: false,
			};

			this._openTabs.update((prev) => {
				const copy = [...prev, newTab];
				this.tabChanges$.next(copy);
				return copy;
			});

			this.setActiveTab(newTab.id);
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert("Failed to open history item", "error");
		}
	}

	public async createFreshTab() {
		try {
			const newDraft: models.AddDraftDTO = {
				id: nanoid(),
				workspace_id: this._workspaceId(),
			};

			const newTab: ApplicationTab = {
				id: nanoid(),
				entityId: newDraft.id,
				entityType: AppTabType.Req,
				name: "New Request",
				tag: "GET",
				isModified: false,
			};

			await this.reqRepo.addFreshDraft(newDraft);

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

	public async createMockTabFromSaved(item: models.MockLightDTO) {
		try {
			const newDraft: models.AddDraftDTO = {
				id: nanoid(),
				workspace_id: this._workspaceId(),
			};

			console.dir(newDraft);

			await this.mockRepo.createMockDraftFromMock(item.id, newDraft);

			const newTab: ApplicationTab = {
				id: nanoid(),
				name: item.name,
				tag: item.method,
				entityId: newDraft.id,
				entityType: AppTabType.Mock,
				isModified: false,
			};

			this._openTabs.update((prev) => {
				const copy = [...prev, newTab];
				this.tabChanges$.next(copy);
				return copy;
			});

			this.setActiveTab(newTab.id);
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert("Failed to open mock", "error");
		}
	}

	public async createFreshMockTab() {
		try {
			const newDraft: models.AddDraftDTO = {
				id: nanoid(),
				workspace_id: this._workspaceId(),
			};

			const newTab: ApplicationTab = {
				id: nanoid(),
				entityId: newDraft.id,
				entityType: AppTabType.Mock,
				name: "New Mock",
				tag: "GET",
				isModified: false,
			};

			await this.mockRepo.createFreshMockDraft(newDraft);

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

	public async createMockTab() {
		const newTab: ApplicationTab = {
			id: nanoid(),
			entityId: nanoid(),
			entityType: AppTabType.Mock,
			name: "New Mock",
			tag: "GET",
			isModified: false,
		};

		this._openTabs.update((prev) => {
			const copy = [...prev, newTab];
			this.tabChanges$.next(copy);
			return copy;
		});

		this.setActiveTab(newTab.id);
	}

	public emitTabCloseEvent(tabId: string) {
		const tab = this._openTabs().find((x) => x.id === tabId);

		if (!tab) {
			return;
		}

		if (this.tabCount() === 1) {
			return;
		}

		if (tab.entityType === AppTabType.Env) {
			this.closeEnvTabEvent$.next(tab);
			return;
		}

		if (tab.entityType === AppTabType.Req) {
			this.closeReqTabEvent$.next(tab);
			return;
		}

		if (tab.entityType === AppTabType.Mock) {
			this.closeMockTabEvent$.next(tab);
			return;
		}

		if (tab.entityType === AppTabType.ReqExample) {
			this.deleteTab(tab.id, AppTabType.ReqExample);
		}
	}

	public async closeExampleTab(id: string) {
		const tab = this._openTabs().find((x) => x.entityId === id);
		if (tab) {
			this.deleteTab(tab.id, AppTabType.ReqExample);
		}
		const tabCount = this.tabCount();
		if (tabCount === 0) {
			await this.createFreshTab();
		}
	}

	public deleteTab(id: string, tabType: AppTabType) {
		this._openTabs.update((prev) => {
			const i = prev.findIndex((x) => x.id === id && x.entityType === tabType);
			if (i === -1) {
				return prev;
			}

			if (this.activeTab() === id) {
				const nextTab = prev[i + 1];
				const prevTab = prev[i - 1];
				const newTabId = nextTab?.id || prevTab?.id || null;
				console.log(`new active tab id after closing current is ${newTabId}`);
				this.setActiveTab(newTabId);
			}

			if (tabType === AppTabType.Req) {
				this.reqDraftDeleted$.next(prev[i].entityId);
			}

			if (tabType === AppTabType.Env) {
				this.envDraftDeleted$.next(prev[i].entityId);
			}

			if (tabType === AppTabType.Mock) {
				this.mockDraftDeleted$.next(prev[i].entityId);
			}

			const copy = prev.filter((x) => x.id !== id);
			this.tabChanges$.next(copy);

			return copy;
		});
	}

	public setActiveTab(id: string | null) {
		this._activeTab.set(id);
		this.activeTabChanges$.next(id || "");
	}

	public getTabById(id: string) {
		return this._openTabs().find((x) => x.id === id) || null;
	}

	public updateModifiedStatus(isModified: boolean) {
		const i = this._openTabs().findIndex((x) => x.id === this._activeTab());

		if (i === -1) {
			return;
		}
		const copy = [...this._openTabs()];
		copy[i].isModified = isModified;
		this._openTabs.set(copy);
		this.tabChanges$.next(copy);
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
			switch (prop) {
				case "name":
					copy[i][prop] = v || "New Request";
					break;
				case "tag":
					copy[i][prop] = v;
					break;
			}
			this.tabChanges$.next(copy);
			return copy;
		});
	}

	init(workspaceInfo: models.WorkspaceDTO) {
		this.setWorkspaceId(workspaceInfo.id);
		const { openTabsJSON, activeTab } = workspaceInfo;
		const parsedTabs: ApplicationTab[] = JSON.parse(openTabsJSON);
		if (Array.isArray(parsedTabs) && parsedTabs.length) {
			console.log(`populating tabs`);
			this._openTabs.set(parsedTabs);

			if (parsedTabs.findIndex((x) => x.id === activeTab) > -1) {
				this._activeTab.set(activeTab);
			} else {
				this._activeTab.set(parsedTabs[0].id);
			}
		} else {
			this._openTabs.set([]);
			this.createFreshTab();
		}
	}

	clean() {
		this._openTabs.set([]);
		this._workspaceId.set("");
		this._activeTab.set("");
	}
}
