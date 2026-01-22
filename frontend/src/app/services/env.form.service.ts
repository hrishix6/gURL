import {
	computed,
	DestroyRef,
	Injectable,
	inject,
	signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
	FindEnvDraft,
	SaveEnvDraftAsEnv,
	UpdateEnvDraftData,
} from "@wailsjs/go/storage/Storage";
import { nanoid } from "nanoid";
import { debounceTime, Subject } from "rxjs";
import { ENV_ID_PLACEHOLDER } from "@/constants";
import {
	AppTabType,
	type EnvironmentDraftParent,
	type EnvironmentItem,
} from "@/types";
import { AppService } from "./app.service";
import { TabsService } from "./tabs.service";

@Injectable()
export class EnvFormService {
	private _envDraftId: string = "";
	private destroyRef = inject(DestroyRef);

	private _tabSvc = inject(TabsService);
	private _appSvc = inject(AppService);

	private envDataDbSync$ = new Subject<EnvironmentItem[]>();

	private _parentMeta = signal<EnvironmentDraftParent>({
		parentEnvId: "",
		parentEnvName: "",
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

	public async initializeEnvForm(envDraftId: string) {
		try {
			console.log(`Initializing environment draft ${envDraftId}`);
			//fetch data from the backend and populate draft state.
			const draft = await FindEnvDraft(envDraftId);

			if (!draft) {
				//TODO: show error
				return;
			}

			const { id, name, dataJSON, parentEnvId, parentEnvName } = draft;
			this._envDraftId = id;
			this._envName.set(name);
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
		} catch (error) {
			console.error(
				`Error initializing environment draft ${envDraftId}:`,
				error,
			);
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

			await SaveEnvDraftAsEnv({
				draftId: this._envDraftId,
				envId: envId,
				name: this.environmentName(),
			});

			this._appSvc.refreshEnvs$.next();

			this._parentMeta.set({
				parentEnvId: envId,
				parentEnvName: this.environmentName(),
			});

			this._tabSvc.updateActiveTab("name", this.environmentName());
			this._tabSvc.updateModifiedStatus(false);
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
		this._tabSvc.refreshNotifier
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (v) => {
					if (v === AppTabType.Env) {
						console.log(`received signal to refresh self`);
						this.initializeEnvForm(this._envDraftId);
					}
				},
			});

		this.envDataDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					UpdateEnvDraftData({
						draftId: this._envDraftId,
						dataJSON: JSON.stringify(
							v.filter((x) => x.id !== ENV_ID_PLACEHOLDER),
						),
					}).then(() => {
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
	}
}
