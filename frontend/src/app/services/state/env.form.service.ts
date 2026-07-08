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
import { envItemsToBulkEditText } from "@/common/utils/text";
import { ENV_ID_PLACEHOLDER } from "@/constants";
import {
	AlertService,
	AppService,
	getEnvRepository,
	TabsService,
} from "@/services";
import {
	AppTabType,
	type CrumbInfo,
	type EnvironmentDraftParent,
	type EnvironmentItem,
	type FetchState,
} from "@/types";

@Injectable()
export class EnvFormService {
	private _envTabId: string = "";
	private _envDraftId: string = "";
	private destroyRef = inject(DestroyRef);
	private readonly envRepo = getEnvRepository();

	private _tabSvc = inject(TabsService);
	private _appSvc = inject(AppService);
	private _alertSvc = inject(AlertService);

	private envDataDbSync$ = new Subject<EnvironmentItem[]>();

	private _parentMeta = signal<EnvironmentDraftParent>({
		parentEnvId: "",
		parentEnvName: "",
	});

	private _bulkEditMode = signal<boolean>(false);

	public bulkEditMode = computed(() => this._bulkEditMode());

	public toggleBulkEditMode() {
		this._bulkEditMode.update((x) => !x);
	}

	private _bulkEditText = signal<string>("");

	public setBulkEditText(s: string) {
		this._bulkEditText.set(s);
	}

	public bulkEnvText = computed(() => {
		return envItemsToBulkEditText(
			this._environmentFormItems(),
			ENV_ID_PLACEHOLDER,
		);
	});

	public bulkupdateEnvItems(items: EnvironmentItem[]) {
		const newParams = [
			...items,
			{
				id: ENV_ID_PLACEHOLDER,
				key: "",
				val: "",
				isSecret: false,
				description: "",
			},
		];
		this._environmentFormItems.set(newParams);
		this.envDataDbSync$.next(newParams);
		this._tabSvc.updateModifiedStatus(true);
	}

	private _crumbInfo = signal<CrumbInfo>({
		entityName: "New Environment",
	});

	public fetchState = signal<FetchState>({
		loaded: false,
		attempts: 0,
		error: false,
		loading: false,
	});

	public parentEnvId = computed(() => this._parentMeta().parentEnvId);

	private _envName = signal<string>('"New Environment"');
	public envNameError = signal<boolean>(false);
	public envNameErrMsg = signal<string>("");
	public environmentName = computed(() => this._envName());

	public setEnvironmentName(name: string) {
		this._envName.set(name);
		this.envNameError.set(false);
		this.envNameErrMsg.set("");
		this._tabSvc.updateModifiedStatus(true);
	}

	public validateEnvName() {
		if (this._envName() === "" || this._envName().trim() === "") {
			this.envNameError.set(true);
			this.envNameErrMsg.set("name cannot be empty");
			return;
		}

		const exists = this._appSvc
			.environments()
			.find((x) => x.name === this.environmentName());

		if (exists) {
			if (exists.id === this.parentEnvId()) {
				return;
			}
			this.envNameError.set(true);
			this.envNameErrMsg.set("Another environment with same name exists");
		}
	}

	private _environmentFormItems = signal<EnvironmentItem[]>([
		{
			id: ENV_ID_PLACEHOLDER,
			key: "",
			val: "",
			isSecret: false,
			description: "",
		},
	]);

	public environmentFormItems = computed(() => this._environmentFormItems());

	public addItem() {
		this._environmentFormItems.update((prev) => {
			const placeholderItemIndex = prev.findIndex(
				(x) => x.id === ENV_ID_PLACEHOLDER,
			);

			if (placeholderItemIndex >= 0) {
				return prev;
			}

			return [
				...prev,
				{
					id: ENV_ID_PLACEHOLDER,
					key: "",
					val: "",
					isSecret: false,
					description: "",
				},
			];
		});
	}

	public updatetItem(
		id: string,
		prop: Exclude<keyof EnvironmentItem, "id" | "isSecret">,
		value: string,
	) {
		this._environmentFormItems.update((prev) => {
			const i = prev.findIndex((x) => x.id === id);
			if (i === -1) {
				return prev;
			}

			const copy = [...prev];
			copy[i][prop] = value;

			if (id === ENV_ID_PLACEHOLDER) {
				copy[i].id = nanoid();
			}

			this.envDataDbSync$.next(copy);

			this._tabSvc.updateModifiedStatus(true);

			return copy;
		});
	}

	public deleteItem(id: string) {
		this._environmentFormItems.update((prev) => {
			const copy = prev.filter((x) => x.id !== id);
			this.envDataDbSync$.next(copy);
			this._tabSvc.updateModifiedStatus(true);

			return copy;
		});
	}

	public toggleItemSecretStatus(id: string) {
		this._environmentFormItems.update((prev) => {
			const i = prev.findIndex((x) => x.id === id);
			if (i === -1) {
				return prev;
			}

			const copy = [...prev];

			copy[i].isSecret = !copy[i].isSecret;

			this.envDataDbSync$.next(copy);
			this._tabSvc.updateModifiedStatus(true);

			return copy;
		});
	}

	public async initializeEnvForm(tabId: string, envDraftId: string) {
		this._envTabId = tabId;
		this._envDraftId = envDraftId;

		const activeTabId = this._tabSvc.activeTab();

		if (activeTabId !== tabId) {
			console.log(`not loading env draf data as it's not active`);
			return;
		}

		await this.fetchEnvDraft(tabId, envDraftId);

		const crumbInfo = this._crumbInfo();

		if (crumbInfo) {
			this._tabSvc.setCrumbs(crumbInfo, AppTabType.Env);
		}
	}

	public async fetchEnvDraft(tabId: string, envDraftId: string) {
		try {
			this.fetchState.update((prev) => ({
				...prev,
				error: false,
				loaded: false,
				loading: true,
			}));

			const draft = await this.envRepo.findEnvDraft(envDraftId);

			if (!draft) {
				throw new Error(`No draft found with id ${envDraftId} in db`);
			}

			const { name, dataJSON, parentEnvId, parentEnvName } = draft;

			this._envName.set(name);

			this._crumbInfo.set({
				entityName: name,
			});

			this._parentMeta.set({
				parentEnvId,
				parentEnvName,
			});

			this._environmentFormItems.set([
				...JSON.parse(dataJSON),
				{
					id: ENV_ID_PLACEHOLDER,
					key: "",
					val: "",
					isSecret: false,
					description: "",
				},
			]);

			this.fetchState.update((prev) => ({
				...prev,
				loaded: true,
			}));
		} catch (error) {
			console.error(error);
			this.fetchState.update((prev) => ({
				...prev,
				error: true,
			}));
			this._alertSvc.addAlert("Failed to load environment draft", "error");
			this._tabSvc.deleteTab(tabId, AppTabType.Env);
		} finally {
			this.fetchState.update((prev) => ({
				...prev,
				attempts: prev.attempts + 1,
				loading: false,
			}));
		}
	}

	public async saveEnv() {
		try {
			console.log(
				`trying to save env draft: #${this._envDraftId} as request with name ${this.environmentName()}`,
			);

			const { parentEnvId } = this._parentMeta();

			let envId = "";

			if (!parentEnvId) {
				envId = nanoid();
			} else {
				envId = parentEnvId;
			}

			await this.envRepo.saveEnvDraftAsEnv(this._envDraftId, {
				envId: envId,
				name: this.environmentName(),
				workspaceId: this._appSvc.activeWorkSpace().id,
			});

			this._alertSvc.addAlert(
				`Environment "${this.environmentName()}" saved.`,
				"success",
			);

			this._appSvc.refreshEnvs$.next();
			this._appSvc.envUpdated$.next(envId);
			this._parentMeta.set({
				parentEnvId: envId,
				parentEnvName: this.environmentName(),
			});

			this._crumbInfo.set({
				entityName: this.environmentName(),
			});

			this._tabSvc.updateActiveTab("name", this.environmentName());
			this._tabSvc.updateModifiedStatus(false);

			this._tabSvc.setCrumbs(this._crumbInfo(), AppTabType.Env);
		} catch (error) {
			console.error(error);
		}
	}

	public saveDraftModalTitle = computed(() => {
		const { parentEnvId, parentEnvName } = this._parentMeta();

		if (!parentEnvId) {
			return "Save draft as Environment ?";
		}

		return `Save changes for environment "${parentEnvName}" ?`;
	});

	public saveDraftModalMessage = computed(() => {
		const { parentEnvId } = this._parentMeta();

		if (!parentEnvId) {
			return "Your changes will be lost, save these changes to avoid losing work.";
		}

		return "Your changes to the environment will be lost, save these changes to avoid losing work.";
	});

	//#region request-ops
	private _isDraftSavePreferenceModalOpen = signal<boolean>(false);

	public isDraftSavePreferenceModalOpen = computed(() =>
		this._isDraftSavePreferenceModalOpen(),
	);

	public toggleDraftSavePreferenceModal() {
		this._isDraftSavePreferenceModalOpen.update((x) => !x);
	}

	constructor() {
		this._tabSvc.environmentDeleteNotifier
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (deletedEnvId) => {
					if (this.parentEnvId() === deletedEnvId) {
						console.log(`parent env deleted, refreshing env draft`);
						this.fetchEnvDraft(this._envTabId, this._envDraftId);
					}
				},
			});

		this.envDataDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					this.envRepo
						.updateEnvDraftData(this._envDraftId, {
							dataJSON: JSON.stringify(
								v.filter((x) => x.id !== ENV_ID_PLACEHOLDER),
							),
						})
						.then(() => {
							console.log(`env data updated for draft: ${this._envDraftId}`);
						});
				},
			});

		this._tabSvc.closeEnvTabEvent$
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (tab) => {
					if (tab.entityId !== this._envDraftId) {
						return;
					}

					console.log(
						`received signal to handle env tab close for ${tab.id} and env draft ${this._envDraftId}`,
					);

					const parentEnvId = this.parentEnvId();

					if (parentEnvId) {
						if (tab.isModified) {
							if (!this._appSvc.alwaysDiscardEnvDrafts()) {
								console.log(
									`draft is linked to ${parentEnvId} and modified asking to save`,
								);
								this._tabSvc.setActiveTab(tab.id);
								this._isDraftSavePreferenceModalOpen.set(true);
								return;
							}
						}
						console.log(
							`draft is linked to ${parentEnvId} and not modified or user doesn't want to save, closing tab`,
						);
						this._tabSvc.deleteTab(tab.id, AppTabType.Env);
					} else {
						if (tab.isModified) {
							if (!this._appSvc.alwaysDiscardEnvDrafts()) {
								console.log(
									`draft is not linked to any request, asking to save as new env`,
								);
								this._tabSvc.setActiveTab(tab.id);
								this._isDraftSavePreferenceModalOpen.set(true);
								return;
							}
						}
						console.log(
							`draft is not linked to any env and user doesn't want to save drafts, closing tab`,
						);
						this._tabSvc.deleteTab(tab.id, AppTabType.Env);
					}
				},
			});

		this._tabSvc.activeTabChanges$
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (tab) => {
					if (this._envTabId === tab) {
						const { attempts } = this.fetchState();
						if (!attempts) {
							console.log(`fetching data for env Tab ${tab} from constructor`);
							this.fetchEnvDraft(this._envTabId, this._envDraftId).then(() => {
								const c = this._crumbInfo();
								if (c) {
									console.log(
										`this draft is active, setting updated crumbinfo`,
									);
									this._tabSvc.setCrumbs(c, AppTabType.Env);
								}
							});
						} else {
							console.log(`data for tab ${tab} is already loaded`);
							this._tabSvc.setCrumbs(this._crumbInfo(), AppTabType.Env);
						}
					}
				},
			});
	}
}
