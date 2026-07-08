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
import { extractTokens } from "@/common/utils/tokens";
import {
	MOCK_BODY_TYPES,
	MOCK_DETAILS_TABS,
	NO_ENV_ID,
	REQ_METHODS,
} from "@/constants";
import {
	AlertService,
	AppService,
	getReqMocksRepository,
	TabsService,
} from "@/services";
import { HeadersService } from "@/services/state/http/headers.service";
import {
	AppTabType,
	type CrumbInfo,
	type DropDownItem,
	type FetchState,
	type InputToken,
	type MockBodyType,
	type MockParentMetadata,
	type MockTabId,
	type RequestMethod,
} from "@/types";

@Injectable()
export class MockTabFormService {
	private tabId: string = "";
	private draftId: string = "";
	private readonly tabSvc = inject(TabsService);
	private readonly alertSvc = inject(AlertService);
	private readonly appSvc = inject(AppService);
	private readonly mockRepo = getReqMocksRepository();

	// db sync
	public bodyTypeDbSync$ = new Subject<MockBodyType>();
	private binaryBDbSync$ = new Subject<models.FileStats | null>();
	private textBDbSync$ = new Subject<string>();

	public fetchState = signal<FetchState>({
		loaded: false,
		attempts: 0,
		error: false,
		loading: false,
	});

	private _parentMeta = signal<MockParentMetadata>({
		parentCollectionId: "",
		parentMockId: "",
		parentMockName: "",
	});

	public parentMeta = computed(() => this._parentMeta());

	private _crumbInfo = signal<CrumbInfo>({ entityName: "New Mock" });

	public disableSave = computed(() => this.mockPath() === "");

	private destroyRef = inject(DestroyRef);

	public headersSyncNotifier$ = new Subject<models.GurlKeyValItem[]>();

	public notifyHeaderSync = (v: models.GurlKeyValItem[]) => {
		this.headersSyncNotifier$.next(v);
	};

	public readonly headerSvc = new HeadersService(
		this.destroyRef,
		this.notifyHeaderSync,
	);

	private populateMockState(data: models.MockDraftDTO) {
		this.headerSvc.initMock(data.headers);
		this._mockPath.set(data.path);

		this._method.set(
			REQ_METHODS.find((x) => x.id === data.method) || REQ_METHODS[0],
		);

		this._activeEnvironment.set(
			this.appSvc.environments().find((x) => x.id === data.environmentId)?.id ||
				NO_ENV_ID,
		);

		this._mockDelaySeconds.set(data.delayS.toString());
		this._mockstatusCode.set(data.status.toString());

		this._bodyType.set(
			MOCK_BODY_TYPES.find((x) => x.id === data.bodyType) || MOCK_BODY_TYPES[0],
		);

		this._textBody.set(data.text);
		this._binaryBody.set(data.binary ? JSON.parse(data.binary) : null);
	}

	public async initializeForm(tabId: string, id: string) {
		this.tabId = tabId;
		this.draftId = id;

		if (this.tabSvc.activeTab() !== tabId) {
			console.log(
				`not fetching data for Tab ${tabId} for entity of type mock with id ${id} as it's not active`,
			);
			return;
		}

		console.log(
			`fetching data for Tab ${tabId} for entity of type mock with id ${id} from initFn`,
		);

		await this.fetchdraftData(id);

		const crumbInfo = this._crumbInfo();

		if (crumbInfo) {
			this.tabSvc.setCrumbs(crumbInfo, AppTabType.Mock);
		}
	}

	private async fetchdraftData(id: string) {
		try {
			this.fetchState.update((prev) => ({
				...prev,
				error: false,
				loaded: false,
				loading: true,
			}));

			const dbDraftData = await this.mockRepo.getMockDraftById(id);

			if (!dbDraftData) {
				throw new Error("Mock draft not found");
			}

			const {
				parentCollectionId,
				parentMockId,
				parentMockName,
				collectionInfo,
			} = dbDraftData;

			this._parentMeta.set({
				parentCollectionId,
				parentMockId,
				parentMockName,
			});

			this.populateMockState(dbDraftData);

			const activeTab = this.tabSvc.getTabById(this.tabId);

			this._crumbInfo.set({
				entityName: activeTab?.name || "New Mock",
				mockServer: collectionInfo?.name,
			});

			this.fetchState.update((prev) => ({
				...prev,
				loaded: true,
			}));
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to load mock tab`, "error");
			this.fetchState.update((prev) => ({
				...prev,
				error: true,
			}));
		} finally {
			this.fetchState.update((prev) => ({
				...prev,
				attempts: prev.attempts + 1,
				loading: false,
			}));
		}
	}

	private methodDbSync$ = new Subject<RequestMethod>();
	private _method = signal<DropDownItem<RequestMethod>>(REQ_METHODS[0]);
	public method = computed(() => this._method());

	public setSelectedMethod(method: RequestMethod) {
		const itemIndex = REQ_METHODS.findIndex((x) => x.id === method);
		if (itemIndex > -1) {
			const selectedMethod = REQ_METHODS[itemIndex];
			this._method.set(selectedMethod);
			this.tabSvc.updateModifiedStatus(true);
			this.methodDbSync$.next(method);
		}
	}

	statusInvalid = signal<boolean>(false);
	_mockstatusCode = signal<string>("200");
	mockStatusCodeDbSync$ = new Subject<string>();
	mockstatusCode = computed(() => this._mockstatusCode());

	public setMockStatusCode(status: string) {
		this._mockstatusCode.update((prev) => {
			if (prev === status) {
				return prev;
			}

			if (Number.isNaN(parseInt(status, 10))) {
				this.statusInvalid.set(true);
			} else {
				this.statusInvalid.set(false);
			}

			this.tabSvc.updateModifiedStatus(true);
			this.mockStatusCodeDbSync$.next(status);
			return status;
		});
	}

	public statusCodeDefault() {
		const d = this._mockstatusCode();

		if (d === "") {
			this.setMockStatusCode("200");
		}
	}

	delayInvalid = signal<boolean>(false);
	_mockDelaySeconds = signal<string>("0");
	mockDelaySecondsDbSync$ = new Subject<string>();
	mockDelaySeconds = computed(() => this._mockDelaySeconds());

	public setMockDelaySeconds(status: string) {
		this._mockDelaySeconds.update((prev) => {
			if (prev === status) {
				return prev;
			}

			if (Number.isNaN(parseInt(status, 10))) {
				this.delayInvalid.set(true);
			} else {
				this.delayInvalid.set(false);
			}

			this.tabSvc.updateModifiedStatus(true);
			this.mockDelaySecondsDbSync$.next(status);
			return status;
		});
	}

	public delayDefault() {
		const d = this._mockDelaySeconds();

		if (d === "") {
			this.setMockDelaySeconds("0");
		}
	}

	private activeEnvDbSync$ = new Subject<string>();

	public environmentDropdownItems = computed<DropDownItem<string>[]>(() => {
		const t = this.appSvc.environments().map((env) => ({
			id: env.id,
			displayName: env.name,
		}));

		return [{ id: NO_ENV_ID, displayName: "None" }, ...t];
	});

	private _activeEnvironment = signal<string>(NO_ENV_ID);

	public activeEnvironment = computed(() => this._activeEnvironment());

	public activeEnvChange$ = new Subject<void>();

	public setActiveEnvironment(id: string) {
		const index = this.environmentDropdownItems().findIndex((x) => x.id === id);
		if (index > -1) {
			this._activeEnvironment.set(id);
			this.activeEnvDbSync$.next(id);
			this.activeEnvChange$.next();
		}
	}

	mockTabs = MOCK_DETAILS_TABS;

	activeMockTab = signal<MockTabId>(MOCK_DETAILS_TABS[0].id);

	handleSelectMockTab(id: MockTabId) {
		this.activeMockTab.set(id);
	}

	pathInvalid = signal<boolean>(false);

	private mockpathDbSync$ = new Subject<string>();
	private _mockPath = signal<string>("");
	mockPath = computed(() => this._mockPath());

	setMockPath(v: string) {
		this._mockPath.update((prev) => {
			if (prev === v) {
				return prev;
			}

			this.tabSvc.updateModifiedStatus(true);
			this.mockpathDbSync$.next(v);
			return v;
		});
	}

	public saveDraftModalTitle = computed(() => {
		const { parentMockId, parentMockName } = this.parentMeta();

		if (!parentMockId) {
			return "Save draft as Mock ?";
		}

		return `Save changes for Mock "${parentMockName}" ?`;
	});

	public saveDraftModalMessage = computed(() => {
		const { parentMockId } = this.parentMeta();

		if (!parentMockId) {
			return "Your changes will be lost, save these changes to avoid losing work.";
		}

		return "Your changes to the Mock will be lost, save these changes to avoid losing work.";
	});

	private _isDraftSavePreferenceModalOpen = signal<boolean>(false);

	public isDraftSavePreferenceModalOpen = computed(() =>
		this._isDraftSavePreferenceModalOpen(),
	);

	public toggleDraftSavePreferenceModal() {
		this._isDraftSavePreferenceModalOpen.update((x) => !x);
	}

	private _saveMockModalOpen = signal<boolean>(false);
	public isSaveMockModalOpen = computed(() => this._saveMockModalOpen());

	public toggleSaveMockModal() {
		this._saveMockModalOpen.update((x) => !x);
	}

	public async saveMock(name: string, collectionId: string) {
		try {
			console.log(
				`trying to save draft: #${this.draftId} as mock with name ${name} in collection #${collectionId}`,
			);

			const { parentMockId } = this.parentMeta();

			let mockId = "";

			if (parentMockId) {
				mockId = parentMockId;
			} else {
				mockId = nanoid();
			}

			const updatedDraft = await this.mockRepo.saveMockDraftAsMock(
				this.draftId,
				{
					collectionId,
					mockId,
					name,
					workspaceId: this.appSvc.activeWorkSpace().id,
				},
			);

			if (!updatedDraft) {
				throw new Error("failed to save");
			}

			this.alertSvc.addAlert(`Mock "${name}" saved`, "success");

			this._parentMeta.set({
				parentCollectionId: collectionId,
				parentMockId: mockId,
				parentMockName: name,
			});

			this.tabSvc.updateActiveTab("name", name);
			this.tabSvc.updateModifiedStatus(false);

			this._crumbInfo.set({
				mockServer: updatedDraft.collectionInfo?.name,
				entityName: name,
			});

			this.tabSvc.setCrumbs(this._crumbInfo(), AppTabType.Mock);
			await this.appSvc.fetchUpdatedMock(mockId);
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert(`Failed to save mock`, "error");
		} finally {
			this.toggleSaveMockModal();
		}
	}

	parseMockPath() {
		const v = this.mockPath();
		if (!v) {
			return;
		}
		try {
			const x = URL.parse(v, "https://example.com");

			if (x == null) {
				throw new Error("invalid path");
			}

			const parsed = decodeURIComponent(x.pathname);
			this.setMockPath(parsed);
		} catch (error) {
			console.error(error);
			this.pathInvalid.set(true);
		}
	}

	public mockTabExtractTokensCB = (v: string) => {
		return this.extractTokens(v);
	};

	public resolveEnvVariable = (key: string) => {
		return this.appSvc.resolveVar(key, this._activeEnvironment());
	};

	public extractTokens(v: string): InputToken[] {
		const tokens = extractTokens(v);
		for (const token of tokens) {
			if (token.type === "env") {
				[token.valid, token.interpolated] =
					this.appSvc.validateInterpolatedToken(
						token,
						this._activeEnvironment(),
					);
			}
		}

		return tokens;
	}

	private _bodyType = signal<DropDownItem<MockBodyType>>(MOCK_BODY_TYPES[0]);
	public bodyType = computed(() => this._bodyType());

	public setBodyType(v: MockBodyType) {
		const itemIndex = MOCK_BODY_TYPES.findIndex((x) => x.id === v);
		if (itemIndex > -1) {
			this._bodyType.set(MOCK_BODY_TYPES[itemIndex]);
			this.bodyTypeDbSync$.next(v);
			this.tabSvc.updateModifiedStatus(true);
		}
	}

	private _binaryBody = signal<models.FileStats | null>(null);
	public binaryBody = computed(() => this._binaryBody());

	public setBinaryBody(v: models.FileStats) {
		this._binaryBody.set(v);
		this.binaryBDbSync$.next(v);
		this.tabSvc.updateModifiedStatus(true);
	}

	public clearBinaryBody() {
		this._binaryBody.set(null);
		this.tabSvc.updateModifiedStatus(true);
		this.binaryBDbSync$.next(null);
	}

	private _textBody = signal<string>("");
	public textBody = computed(() => this._textBody());
	public setTextBody(v: string) {
		this._textBody.set(v);
		this.tabSvc.updateModifiedStatus(true);
		this.textBDbSync$.next(v);
	}

	//#region proxy-setters
	public deleteHeader(id: string) {
		this.headerSvc._deleteHeader(id);
		this.tabSvc.updateModifiedStatus(true);
	}

	public updateHeader(
		id: string,
		prop: Exclude<keyof models.GurlKeyValItem, "id">,
		v: string,
	) {
		this.headerSvc._updateHeader(id, prop, v);
		this.tabSvc.updateModifiedStatus(true);
	}

	public addHeader() {
		this.headerSvc.addHeader();
		this.tabSvc.updateModifiedStatus(true);
	}

	public bulkUpdateHeadersParams(items: models.GurlKeyValItem[]) {
		this.headerSvc._bulkUpdateHeadersParams(items);
		this.tabSvc.updateModifiedStatus(true);
	}

	constructor() {
		this.tabSvc.mockDeleteNotifier
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (deletedMockId) => {
					const { parentMockId } = this.parentMeta();
					if (deletedMockId === parentMockId) {
						console.log(`parent mock was deleted, refreshing draft`);
						this.fetchdraftData(this.draftId).then(() => {
							const activeTab = this.tabSvc.activeTab();
							if (activeTab === this.tabId) {
								const v = this._crumbInfo();
								if (v) {
									console.log(
										`this draft is active, setting updated crumbinfo`,
									);
									this.tabSvc.setCrumbs(v, AppTabType.Mock);
								}
							}
						});
					}
				},
			});

		this.tabSvc.collectionDeleteNotifier
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (deletedCollectionId) => {
					const { parentCollectionId } = this._parentMeta();
					if (deletedCollectionId === parentCollectionId) {
						console.log(`parent collection was deleted, refreshing mock`);
						this.fetchdraftData(this.draftId).then(() => {
							const activeTab = this.tabSvc.activeTab();
							if (activeTab === this.tabId) {
								const v = this._crumbInfo();
								if (v) {
									console.log(
										`this draft is active, setting updated crumbinfo`,
									);
									this.tabSvc.setCrumbs(v, AppTabType.Mock);
								}
							}
						});
					}
				},
			});

		this.tabSvc.activeTabChanges$
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (v) => {
					if (this.tabId === v) {
						const { attempts } = this.fetchState();
						if (!attempts) {
							console.log(`fetching data for Tab ${v} from constructor`);
							this.fetchdraftData(this.draftId).then(() => {
								const c = this._crumbInfo();
								if (c) {
									console.log(
										`this draft is active, setting updated crumbinfo`,
									);
									this.tabSvc.setCrumbs(c, AppTabType.Mock);
								}
							});
						} else {
							console.log(`data for tab ${v} is already loaded`);
							const c = this._crumbInfo();
							if (c) {
								this.tabSvc.setCrumbs(c, AppTabType.Mock);
							}
						}
					}
				},
			});

		this.headersSyncNotifier$
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (v) => {
					this.mockRepo
						.updateMockDraftFields(this.draftId, {
							headersJson: JSON.stringify(v),
						})
						.then(() => {
							console.log(`mock[${this.draftId}]: updated headers.`);
						});
				},
			});

		this.bodyTypeDbSync$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: (v) => {
				this.mockRepo
					.updateMockDraftFields(this.draftId, {
						bodyType: v,
					})
					.then(() => {
						console.log(`mock[${this.draftId}]: updated body type to ${v}`);
					});
			},
		});

		this.binaryBDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					this.mockRepo
						.updateMockDraftFields(this.draftId, {
							binaryJson: v ? JSON.stringify(v) : "",
						})
						.then(() => {
							console.log(`mock[${this.draftId}]: updated binary body.`);
						});
				},
			});

		this.textBDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(1000))
			.subscribe({
				next: (v) => {
					this.mockRepo
						.updateMockDraftFields(this.draftId, {
							text: v,
						})
						.then(() => {
							console.log(`mock[${this.draftId}]: updated text body. `);
						});
				},
			});

		this.mockpathDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					this.mockRepo
						.updateMockDraftFields(this.draftId, {
							path: v,
						})
						.then(() => {
							console.log(`mock[${this.draftId}]: updated path to '${v}'`);
						});
				},
			});

		this.mockStatusCodeDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					this.mockRepo
						.updateMockDraftFields(this.draftId, {
							status: Number(v),
						})
						.then(() => {
							console.log(
								`mock[${this.draftId}]: updated mock status to '${v}'`,
							);
						});
				},
			});

		this.mockDelaySecondsDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					this.mockRepo
						.updateMockDraftFields(this.draftId, {
							delayS: Number(v),
						})
						.then(() => {
							console.log(
								`mock[${this.draftId}]: updated mock delay seconds to '${v}'`,
							);
						});
				},
			});

		this.methodDbSync$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: (v) => {
				this.mockRepo
					.updateMockDraftFields(this.draftId, {
						method: v,
					})
					.then(() => {
						console.log(`mock[${this.draftId}]: method set to ${v} in db`);
					});
			},
		});

		this.activeEnvDbSync$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: (v) => {
				this.mockRepo
					.updateMockDraftFields(this.draftId, {
						environmentId: v,
					})
					.then(() => {
						console.log(`mock[${this.draftId}]: environment set to ${v} in db`);
					});
			},
		});

		this.tabSvc.closeMockTabEvent$
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (tab) => {
					if (tab.entityId !== this.draftId) {
						return;
					}

					if (this.appSvc.collections().length === 0) {
						this.tabSvc.deleteTab(tab.id, AppTabType.Mock);
						return;
					}

					console.log(
						`received signal to handle tab close for ${tab.id} and draft ${this.draftId}`,
					);

					const { parentMockId } = this.parentMeta();

					if (parentMockId) {
						if (tab.isModified) {
							if (!this.appSvc.alwaysDiscardDrafts()) {
								console.log(
									`draft is linked to ${parentMockId} and modified asking to save`,
								);
								this.tabSvc.setActiveTab(tab.id);
								this._isDraftSavePreferenceModalOpen.set(true);
								return;
							}
						}
						console.log(
							`draft is linked to ${parentMockId} and not modified, closing tab`,
						);

						this.tabSvc.deleteTab(tab.id, AppTabType.Mock);
					} else {
						if (tab.isModified) {
							if (!this.appSvc.alwaysDiscardDrafts()) {
								console.log(
									`draft is not linked to any request, asking to save as new request`,
								);
								this.tabSvc.setActiveTab(tab.id);
								this._isDraftSavePreferenceModalOpen.set(true);
								return;
							}
						}

						console.log(
							`draft is not linked to any request and user doesn't want to save drafts, closing tab`,
						);
						this.tabSvc.deleteTab(tab.id, AppTabType.Mock);
					}
				},
			});

		this.appSvc.envUpdated$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(200))
			.subscribe({
				next: (v) => {
					console.log(`environment ${v} was updated`);
					if (v === this._activeEnvironment()) {
						console.log(
							`environment is active for current mock, refreshing tokens`,
						);
						this.activeEnvChange$.next();
					}
				},
			});
	}
}
