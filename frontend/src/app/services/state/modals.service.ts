import {
	computed,
	DestroyRef,
	Injectable,
	inject,
	signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import type { models } from "@wailsjs/go/models";
import { AppService, TabsService, UserAuthService } from "@/services";
import type { MockCallingInfo } from "@/types";

@Injectable({
	providedIn: "root",
})
export class GlobalModalsService {
	private readonly appSvc = inject(AppService);
	private readonly tabSvc = inject(TabsService);
	private readonly authSvc = inject(UserAuthService);
	private readonly destroyRef = inject(DestroyRef);
	private readonly router = inject(Router);

	constructor() {
		this.appSvc.initiateDefaultWorkspaceCreation$
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(() => {
				this.handleOpenCreateDefaultWorkspaceModal();
			});
	}

	private _inviteUserModalOpen = signal<boolean>(false);
	public inviteUserModalOpen = computed(() => this._inviteUserModalOpen());

	public openInviteUserModal() {
		this._inviteUserModalOpen.set(true);
	}

	public closeInviteUserModal() {
		this._inviteUserModalOpen.set(false);
	}

	public async handleInviteUser(email: string) {
		await this.authSvc.inviteUser(email);
		this.closeInviteUserModal();
	}

	//#region workspace
	private _isCreateDefaultWorkspaceModalOpen = signal<boolean>(false);
	public isCreateDefaultWorkspaceModalOpen = computed(() =>
		this._isCreateDefaultWorkspaceModalOpen(),
	);
	private _defaultWorkspaceCreateProgress = signal<boolean>(false);
	public defaultWorkspaceCreateProgress = computed(() =>
		this._defaultWorkspaceCreateProgress(),
	);

	public handleOpenCreateDefaultWorkspaceModal() {
		this._isCreateDefaultWorkspaceModalOpen.set(true);
	}

	public handleCloseCreateDefaultWorkspaceModal() {
		this._isCreateDefaultWorkspaceModalOpen.set(false);
	}

	public async handleCreateDefaultWorkspace(name: string) {
		try {
			this._defaultWorkspaceCreateProgress.set(true);
			const w = await this.appSvc.createDefaultWorkspace(name);
			this.router.navigate([`/workspaces/${w}`], { replaceUrl: true });
		} catch (error) {
			console.error(error);
			this.router.navigate(["/error"], {
				queryParams: {
					code: "err_app_init",
				},
			});
		} finally {
			this._defaultWorkspaceCreateProgress.set(false);
			this.handleCloseCreateDefaultWorkspaceModal();
		}
	}

	private _workspaceCreateProgress = signal<boolean>(false);
	public WorkspaceCreateProgress = computed(() =>
		this._workspaceCreateProgress(),
	);
	private _isCreateWorkspaceModalOpen = signal<boolean>(false);
	public isCreateWorkspaceModalOpen = computed(() =>
		this._isCreateWorkspaceModalOpen(),
	);

	public handleOpenCreateWorkspaceModal() {
		this._isCreateWorkspaceModalOpen.set(true);
	}

	public handleCloseCreateWorkspaceModal() {
		this._isCreateWorkspaceModalOpen.set(false);
	}

	public async handleCreateWorkspace(name: string) {
		try {
			this._workspaceCreateProgress.set(true);
			await this.appSvc.createNewWorkspace(name);
		} catch (error) {
			console.error(error);
		} finally {
			this._workspaceCreateProgress.set(false);
			this.handleCloseCreateWorkspaceModal();
		}
	}

	//#endregion workspace

	//#region collection

	//#region create-collection

	private _isCreateCollectionModalOpen = signal<boolean>(false);
	public isCreateCollectionModalOpen = computed(() =>
		this._isCreateCollectionModalOpen(),
	);

	handleCloseCreateCollectionModal() {
		this._isCreateCollectionModalOpen.set(false);
	}

	handleOpenCreateCollectionModal() {
		this._isCreateCollectionModalOpen.set(true);
	}

	async handleDesktopCollectionImport() {
		this.handleCloseCreateCollectionModal();
		await this.appSvc.importCollection();
	}

	async handleWebCollectionImport(_file: File) {
		this.handleCloseCreateCollectionModal();
		await this.appSvc.importCollection(_file);
	}

	handleOpenEmptyCollectionDialogue() {
		this.handleCloseCreateCollectionModal();
		this.handleOpenNewEmptyCollectionModal();
	}

	//#endregion create-collection

	//#region empty-collection

	private _isNewEmptyCollectionModalOpen = signal<boolean>(false);
	private _emptyCollectionInProgress = signal<boolean>(false);
	public emptyCollectionInProgress = computed(() =>
		this._emptyCollectionInProgress(),
	);

	public isNewEmptyCollectionModalOpen = computed(() =>
		this._isNewEmptyCollectionModalOpen(),
	);

	handleOpenNewEmptyCollectionModal() {
		this._isNewEmptyCollectionModalOpen.set(true);
	}

	handleCloseNewEmptyCollectionModal() {
		this._isNewEmptyCollectionModalOpen.set(false);
	}

	async handleCreateEmptyCollection(name: string) {
		try {
			this._emptyCollectionInProgress.set(true);
			await this.appSvc.addCollection(name);
		} catch (error) {
			console.error(error);
		} finally {
			this._emptyCollectionInProgress.set(false);
			this.handleCloseNewEmptyCollectionModal();
		}
	}

	//#endregion empty-collection

	//#region delete-collection

	private _deleteCollectionInfo = signal<models.CollectionDTO | null>(null);

	public deleteCollectionModalTitle = computed(() => {
		return `Delete Collection "${this._deleteCollectionInfo()?.name}" ?`;
	});

	public deleteCollectionModalMessage = computed(() => {
		const data = this._deleteCollectionInfo();
		if (data) {
			const reqCount = this.appSvc
				.savedRequests()
				.filter((x) => x.collectionId === data.id).length;

			return `Collection along with ${reqCount} requests will be deleted.`;
		}
		return "";
	});

	private _isDeleteCollectionModalOpen = signal<boolean>(false);
	public isDeleteCollectionModalOpen = computed(() =>
		this._isDeleteCollectionModalOpen(),
	);

	private _deleteCollectionInProgress = signal<boolean>(false);
	public deleteCollectionInProgress = computed(() =>
		this._deleteCollectionInProgress(),
	);

	public handleOpenDeleteCollectionModal(data: models.CollectionDTO) {
		this._deleteCollectionInfo.set(data);
		this._isDeleteCollectionModalOpen.set(true);
	}

	public handleCloseDeleteCollectionModal() {
		this._isDeleteCollectionModalOpen.set(false);
		this._deleteCollectionInfo.set(null);
	}

	public async handleDeleteCollection() {
		try {
			this._deleteCollectionInProgress.set(true);
			const data = this._deleteCollectionInfo();
			if (data) {
				await this.appSvc.deleteCollection(data.id);
			}
		} catch (error) {
			console.error(error);
		} finally {
			this._deleteCollectionInProgress.set(false);
			this.handleCloseDeleteCollectionModal();
		}
	}

	//#endregion delete-collection

	//#region rename-collection

	private _renameCollectionInfo = signal<models.CollectionDTO | null>(null);

	public renameCollectionInitialName = computed(() => {
		const data = this._renameCollectionInfo();

		if (data) {
			return data.name;
		}
		return "";
	});

	private _isRenameCollectionModalOpen = signal<boolean>(false);
	public isRenameCollectionModalOpen = computed(() =>
		this._isRenameCollectionModalOpen(),
	);

	private _renameCollectionInProgress = signal<boolean>(false);
	public renameCollectioinInProgress = computed(() =>
		this._renameCollectionInProgress(),
	);

	public handleOpenRenameCollectionModal(data: models.CollectionDTO) {
		this._renameCollectionInfo.set(data);
		this._isRenameCollectionModalOpen.set(true);
	}
	public handleCloseRenameCollectionModal() {
		this._isRenameCollectionModalOpen.set(false);
		this._renameCollectionInfo.set(null);
	}

	public async handleRenameCollection(newName: string) {
		try {
			this._renameCollectionInProgress.set(true);
			const data = this._renameCollectionInfo();
			if (data) {
				await this.appSvc.renameCollection(data.id, newName);
			}
		} catch (error) {
			console.error(error);
		} finally {
			this._renameCollectionInProgress.set(false);
			this.handleCloseRenameCollectionModal();
		}
	}
	//#endregion rename-collection

	//#region clear-collection

	private _clearCollectionInfo = signal<models.CollectionDTO | null>(null);
	public clearCollectionModalTitle = computed(() => {
		return `Clear Collection "${this._clearCollectionInfo()?.name}" ?`;
	});

	public clearCollectionModalMessage = computed(() => {
		const data = this._clearCollectionInfo();
		if (data) {
			const reqCount = this.appSvc
				.savedRequests()
				.filter((x) => x.collectionId === data.id).length;

			return `${reqCount} requests under collection will be deleted.`;
		}

		return "";
	});

	private _isClearCollectionModalOpen = signal<boolean>(false);
	public isClearCollectionModalOpen = computed(() =>
		this._isClearCollectionModalOpen(),
	);

	private _clearCollectionInProgress = signal<boolean>(false);
	public clearCollectionInProgress = computed(() =>
		this._clearCollectionInProgress(),
	);

	public async handleClearCollection() {
		try {
			this._clearCollectionInProgress.set(true);
			const collectIdToClear = this._clearCollectionInfo();
			if (collectIdToClear) {
				await this.appSvc.clearCollection(collectIdToClear.id);
			}
		} catch (error) {
			console.error(error);
		} finally {
			this._clearCollectionInProgress.set(false);
			this.handleCloseClearCollectionModal();
			this._clearCollectionInfo.set(null);
		}
	}

	public handleOpenClearCollectionModal(data: models.CollectionDTO) {
		this._clearCollectionInfo.set(data);
		this._isClearCollectionModalOpen.set(true);
	}

	public handleCloseClearCollectionModal() {
		this._isClearCollectionModalOpen.set(false);
	}

	//#endregion clear-collection

	//#endregion collection

	//#region request

	//#region create-req

	private _createReqModalOpen = signal<boolean>(false);
	public isCreateReqModalOpen = computed(() => this._createReqModalOpen());

	handleOpenCreateReqModal() {
		this._createReqModalOpen.set(true);
	}

	handleCloseCreateReqModal() {
		this._createReqModalOpen.set(false);
	}

	handleCreateHttpReq() {
		this.handleCloseCreateReqModal();
		this.tabSvc.createFreshTab();
	}

	handleCreateWSSReq() {
		this.handleCloseCreateReqModal();
		//TODO: create fresh tab for WSS
	}

	//#endregion create-req

	//#region delete-req

	private _deleteReqInfo = signal<models.RequestLightDTO | null>(null);

	public deleteReqModalTitle = computed(() => {
		const data = this._deleteReqInfo();
		if (data) {
			return `Delete Request '${data.name}' ?`;
		}

		return "";
	});

	public deleteReqModalMessage = computed(() => {
		return `This action is irreversible, request will be deleted.`;
	});

	private _isDeleteReqModalOpen = signal<boolean>(false);
	public isDeleteReqModalOpen = computed(() => this._isDeleteReqModalOpen());

	private _deleteReqInProgress = signal<boolean>(false);
	public deleteReqInProgress = computed(() => this._deleteReqInProgress());

	public handleOpenDeleteReqModal(data: models.RequestLightDTO) {
		this._deleteReqInfo.set(data);
		this._isDeleteReqModalOpen.set(true);
	}

	public handleCloseDeleteReqModal() {
		this._isDeleteReqModalOpen.set(false);
		this._deleteReqInfo.set(null);
	}

	public async handleDeleteReq() {
		try {
			this._deleteReqInProgress.set(true);
			const data = this._deleteReqInfo();
			if (data) {
				await this.appSvc.deleteRequest(data.id);
			}
		} catch (error) {
			console.error(error);
		} finally {
			this._deleteReqInProgress.set(false);
			this.handleCloseDeleteReqModal();
		}
	}

	//#endregion delete-req

	//#region copy-req

	private _copyReqInfo = signal<models.RequestLightDTO | null>(null);

	public copyReqInitialName = computed(() => {
		const data = this._copyReqInfo();
		if (data) {
			return `${data.name}-copy`;
		}
		return "";
	});

	private _iscopyReqModalOpen = signal<boolean>(false);
	public isCopyReqModalOpen = computed(() => this._iscopyReqModalOpen());

	private _copyReqInProgress = signal<boolean>(false);
	public copyReqInProgress = computed(() => this._copyReqInProgress());

	public handleOpenCopyReqModal(data: models.RequestLightDTO) {
		this._copyReqInfo.set(data);
		this._iscopyReqModalOpen.set(true);
	}
	public handleCloseCopyReqModal() {
		this._iscopyReqModalOpen.set(false);
		this._copyReqInfo.set(null);
	}

	public async handleCopyReq(newName: string) {
		try {
			this._copyReqInProgress.set(true);
			const data = this._copyReqInfo();
			if (data) {
				await this.appSvc.copyRequest(data.id, newName);
			}
		} catch (error) {
			console.error(error);
		} finally {
			this._copyReqInProgress.set(false);
			this.handleCloseCopyReqModal();
		}
	}

	//#endregion copy-req

	//#endregion request

	//#region env

	private _createEnvModalOpen = signal<boolean>(false);
	public isCreateEnvModalOpen = computed(() => this._createEnvModalOpen());

	handleCloseCreateEnvModal() {
		this._createEnvModalOpen.set(false);
	}

	handleOpenCreateEnvModal() {
		this._createEnvModalOpen.set(true);
	}

	handleCreateEmptyEnv() {
		this.handleCloseCreateEnvModal();
		this.tabSvc.createFreshEnvTab();
	}

	async handleImportDesktopEnv() {
		this.handleCloseCreateEnvModal();
		await this.appSvc.importEnvironment();
	}

	async handleImportWebEnv(file: File) {
		this.handleCloseCreateEnvModal();
		await this.appSvc.importEnvironment(file);
	}

	//#region delete-env

	private _deleteEnvInfo = signal<models.EnvironmentDTO | null>(null);

	public deleteEnvModalTitle = computed(() => {
		const data = this._deleteEnvInfo();
		if (data) {
			return `Delete Environment "${data.name}" ?`;
		}

		return "";
	});

	public deleteEnvModalMessage = computed(() => {
		return "This action is irreversible, environment will be deleted.";
	});

	private _isDeleteEnvModalOpen = signal<boolean>(false);
	public isDeleteEnvModalOpen = computed(() => this._isDeleteEnvModalOpen());

	private _DeleteEnvInProgress = signal<boolean>(false);
	public deleteEnvInProgress = computed(() => this._DeleteEnvInProgress());

	public handleOpenDeleteEnvModal(data: models.EnvironmentDTO) {
		this._deleteEnvInfo.set(data);
		this._isDeleteEnvModalOpen.set(true);
	}

	public handleCloseDeleteEnvModal() {
		this._isDeleteEnvModalOpen.set(false);
		this._deleteEnvInfo.set(null);
	}

	public async handleDeleteEnv() {
		try {
			this._DeleteEnvInProgress.set(true);
			const data = this._deleteEnvInfo();
			if (data) {
				await this.appSvc.deleteEnvironment(data.id);
			}
		} catch (error) {
			console.error(error);
		} finally {
			this._DeleteEnvInProgress.set(false);
			this.handleCloseDeleteEnvModal();
		}
	}

	//#endregion delete-env

	//#endregion env

	//#region request-example
	private _deleteReqExampleInfo = signal<models.ReqExampleLightDTO | null>(
		null,
	);

	public deleteReqExampleModalTitle = computed(() => {
		const data = this._deleteReqExampleInfo();
		if (data) {
			return `Delete Example '${data.name}' ?`;
		}

		return "";
	});

	public deleteReqExampleModalMessage = computed(() => {
		return `This action is irreversible, request example will be deleted.`;
	});

	private _isdeleteReqExampleModalOpen = signal<boolean>(false);
	public isdeleteReqExampleModalOpen = computed(() =>
		this._isdeleteReqExampleModalOpen(),
	);

	private _deleteReqExampleInProgress = signal<boolean>(false);
	public deleteReqExampleInProgress = computed(() =>
		this._deleteReqExampleInProgress(),
	);

	public handleOpendeleteReqExampleModal(data: models.ReqExampleLightDTO) {
		this._deleteReqExampleInfo.set(data);
		this._isdeleteReqExampleModalOpen.set(true);
	}

	public handleClosedeleteReqExampleModal() {
		this._isdeleteReqExampleModalOpen.set(false);
		this._deleteReqExampleInfo.set(null);
	}

	public async handledeleteReqExample() {
		try {
			this._deleteReqExampleInProgress.set(true);
			const data = this._deleteReqExampleInfo();
			if (data) {
				await this.appSvc.deleteReqExample(data.id);
			}
		} catch (error) {
			console.error(error);
		} finally {
			this._deleteReqExampleInProgress.set(false);
			this.handleClosedeleteReqExampleModal();
		}
	}
	//#endregion request-example

	//#region delete-mock
	private _deleteMockInfo = signal<models.MockLightDTO | null>(null);

	public deleteMockModalTitle = computed(() => {
		const data = this._deleteMockInfo();
		if (data) {
			return `Delete Mock '${data.name}' ?`;
		}

		return "";
	});

	public deleteMockModalMessage = computed(() => {
		return `This action is irreversible, Mock will be deleted.`;
	});

	private _isDeleteMockModalOpen = signal<boolean>(false);
	public isDeleteMockModalOpen = computed(() => this._isDeleteMockModalOpen());

	private _deleteMockInProgress = signal<boolean>(false);
	public deleteMockInProgress = computed(() => this._deleteMockInProgress());

	public handleOpenDeleteMockModal(data: models.MockLightDTO) {
		this._deleteMockInfo.set(data);
		this._isDeleteMockModalOpen.set(true);
	}

	public handleCloseDeleteMockModal() {
		this._isDeleteMockModalOpen.set(false);
		this._deleteMockInfo.set(null);
	}

	public async handleDeleteMock() {
		try {
			this._deleteMockInProgress.set(true);
			const data = this._deleteMockInfo();
			if (data) {
				await this.appSvc.deleteMock(data.id);
			}
		} catch (error) {
			console.error(error);
		} finally {
			this._deleteMockInProgress.set(false);
			this.handleCloseDeleteMockModal();
		}
	}
	//#endregion delete-mock

	private _openMockInfo = signal<MockCallingInfo | null>(null);

	public openMockServerInfo = computed(() => this._openMockInfo());

	private _isMockInfoModalOpen = signal<boolean>(false);
	public isMockInfoModalOpen = computed(() => this._isMockInfoModalOpen());

	public handleOpenMockInfoModal(data: MockCallingInfo) {
		this._openMockInfo.set(data);
		this._isMockInfoModalOpen.set(true);
	}

	public handleCloseMockInfoModal() {
		this._isMockInfoModalOpen.set(false);
		this._openMockInfo.set(null);
	}
}
