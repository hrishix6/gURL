import { Component, inject } from "@angular/core";
import { AppService, GlobalModalsService } from "@/services";
import { CopyRequestModal } from "./copy.request";
import { CreateCollectionModal } from "./create.collection";
import { CreateEnvironmentModal } from "./create.env";
import { CreateRequestModal } from "./create.req";
import { DeleteConfirmationModal } from "./delete.confirmation";
import { NewCollectionModal } from "./new.collection";
import { DefaultWorkspaceModal } from "./new.workspace";
import { RenameCollectionModal } from "./rename.collection";

@Component({
	selector: "gurl-global-modals-host",
	template: `<ng-content>

    <!-- Workspace modals -->
      @if(modalsSvc.isCreateDefaultWorkspaceModalOpen()){
      <dialog gurl-new-workspace-modal
      [disableClose]="true"
      [actionInProgress]="modalsSvc.defaultWorkspaceCreateProgress()"
      [isOpen]="modalsSvc.isCreateDefaultWorkspaceModalOpen()"
      (onSubmit)="modalsSvc.handleCreateDefaultWorkspace($event)"
      ></dialog>
    }

     @if(modalsSvc.isCreateWorkspaceModalOpen()){
      <dialog gurl-new-workspace-modal
      [disableClose]="false"
      [actionInProgress]="modalsSvc.WorkspaceCreateProgress()"
      [isOpen]="modalsSvc.isCreateWorkspaceModalOpen()"
      (onSubmit)="modalsSvc.handleCreateWorkspace($event)"
      (onCancel)="modalsSvc.handleCloseCreateWorkspaceModal()"
      ></dialog>
    }

    <!-- Collection modals -->
    @if(modalsSvc.isNewEmptyCollectionModalOpen()){
      <dialog gurl-new-collection-modal
      [actionInProgress]="modalsSvc.emptyCollectionInProgress()"
      [isOpen]="modalsSvc.isNewEmptyCollectionModalOpen()"
      (onCancel)="modalsSvc.handleCloseNewEmptyCollectionModal()"
      (onSubmit)="modalsSvc.handleCreateEmptyCollection($event)"
      ></dialog>
    }

    @if(modalsSvc.isCreateCollectionModalOpen()){
      <dialog gurl-create-collection-modal
      [isOpen]="modalsSvc.isCreateCollectionModalOpen()"
      (onCancel)="modalsSvc.handleCloseCreateCollectionModal()"
      (onEmptyCollection)="modalsSvc.handleOpenEmptyCollectionDialogue()"
      (onImportDesktopCollection)="modalsSvc.handleDesktopCollectionImport()"
      (onImportWebCollection)="modalsSvc.handleWebCollectionImport($event)"
      ></dialog>
    }
   
    @if(modalsSvc.isClearCollectionModalOpen()){
        <dialog gurl-rm-confirmation-modal
        [title]="modalsSvc.clearCollectionModalTitle()"
        [message]="modalsSvc.clearCollectionModalMessage()"
        [isOpen]="modalsSvc.isClearCollectionModalOpen()"
        [actionInProgress]="modalsSvc.clearCollectionInProgress()"
        (onCancel)="modalsSvc.handleCloseClearCollectionModal()"
        (onConfirm)="modalsSvc.handleClearCollection()"
        >
        </dialog>
    }

    @if(modalsSvc.isDeleteCollectionModalOpen()) {
        <dialog gurl-rm-confirmation-modal
        [title]="modalsSvc.deleteCollectionModalTitle()"
        [message]="modalsSvc.deleteCollectionModalMessage()"
        [isOpen]="modalsSvc.isDeleteCollectionModalOpen()"
        [actionInProgress]="modalsSvc.deleteCollectionInProgress()"
        (onCancel)="modalsSvc.handleCloseDeleteCollectionModal()"
        (onConfirm)="modalsSvc.handleDeleteCollection()"
        >
        </dialog>
    }

     @if(modalsSvc.isRenameCollectionModalOpen()){
      <dialog  gurl-rename-collection-modal
      [initialValue]="modalsSvc.renameCollectionInitialName()"
      [isOpen]="modalsSvc.isRenameCollectionModalOpen()"
      [actionInProgress]="modalsSvc.renameCollectioinInProgress()"
      (onCancel)="modalsSvc.handleCloseRenameCollectionModal()"
      (onConfirm)="modalsSvc.handleRenameCollection($event)"
      >
    </dialog>
    }

    <!-- Request modals -->

     @if(modalsSvc.isCreateReqModalOpen()){
      <dialog gurl-create-req-modal
        [isOpen]="modalsSvc.isCreateReqModalOpen()"
        (onCancel)="modalsSvc.handleCloseCreateReqModal()"
        (onNewHttp)="modalsSvc.handleCreateHttpReq()"
        (onNewWSS)="modalsSvc.handleCreateWSSReq()"
      ></dialog>
    }

    @if(modalsSvc.isDeleteReqModalOpen()) {
      <dialog gurl-rm-confirmation-modal
        [title]="modalsSvc.deleteReqModalTitle()"
        [message]="modalsSvc.deleteReqModalMessage()"
        [isOpen]="modalsSvc.isDeleteReqModalOpen()"
        [actionInProgress]="modalsSvc.deleteReqInProgress()"
        (onCancel)="modalsSvc.handleCloseDeleteReqModal()"
        (onConfirm)="modalsSvc.handleDeleteReq()"
      ></dialog>
    }

	@if(modalsSvc.isCopyReqModalOpen()) {
      <dialog gurl-cp-request-modal
        [initialValue]="modalsSvc.copyReqInitialName()"
        [isOpen]="modalsSvc.isCopyReqModalOpen()"
        [actionInProgress]="modalsSvc.copyReqInProgress()"
        (onCancel)="modalsSvc.handleCloseCopyReqModal()"
        (onConfirm)="modalsSvc.handleCopyReq($event)"
      ></dialog>
    }
    
    <!-- Environment Modals -->

     @if(modalsSvc.isCreateEnvModalOpen()){
      <dialog gurl-create-env-modal
      [isOpen]="modalsSvc.isCreateEnvModalOpen()"
      (onCancel)="modalsSvc.handleCloseCreateEnvModal()"
      (onEmptyEnv)="modalsSvc.handleCreateEmptyEnv()"
      (onImportDesktopEnv)="modalsSvc.handleImportDesktopEnv()"
      (onImportWebEnv)="modalsSvc.handleImportWebEnv($event)"
      ></dialog>
    }

    @if(modalsSvc.isDeleteEnvModalOpen()) {
      <dialog gurl-rm-confirmation-modal
        [title]="modalsSvc.deleteEnvModalTitle()"
        [message]="modalsSvc.deleteEnvModalMessage()"
        [isOpen]="modalsSvc.isDeleteEnvModalOpen()"
        [actionInProgress]="modalsSvc.deleteEnvInProgress()"
        (onCancel)="modalsSvc.handleCloseDeleteEnvModal()"
        (onConfirm)="modalsSvc.handleDeleteEnv()"
      ></dialog>
    }

    <!-- Request example modals -->
  @if(modalsSvc.isdeleteReqExampleModalOpen()) {
        <dialog gurl-rm-confirmation-modal
          [title]="modalsSvc.deleteReqExampleModalTitle()"
          [message]="modalsSvc.deleteReqExampleModalMessage()"
          [isOpen]="modalsSvc.isdeleteReqExampleModalOpen()"
          [actionInProgress]="modalsSvc.deleteReqExampleInProgress()"
          (onCancel)="modalsSvc.handleClosedeleteReqExampleModal()"
          (onConfirm)="modalsSvc.handledeleteReqExample()"
        ></dialog>
      }
    </ng-content>`,
	imports: [
		CreateEnvironmentModal,
		CreateCollectionModal,
		NewCollectionModal,
		CreateRequestModal,
		DeleteConfirmationModal,
		RenameCollectionModal,
		CopyRequestModal,
		DefaultWorkspaceModal,
	],
})
export class GlobalModalsHost {
	protected readonly modalsSvc = inject(GlobalModalsService);
	protected readonly appSvc = inject(AppService);
}
