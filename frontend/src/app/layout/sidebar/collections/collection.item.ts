import { NgClass } from "@angular/common";
import {
	Component,
	computed,
	HostBinding,
	inject,
	input,
	signal,
} from "@angular/core";
import type { models } from "@wailsjs/go/models";
import {
	Ban,
	ChevronDown,
	ChevronUp,
	EllipsisVertical,
	Eraser,
	FileDown,
	Layers,
	LucideAngularModule,
	SquarePen,
	Trash2,
} from "lucide-angular";
import { DEFAULT_COLLECTION_ID } from "@/constants";
import { DeleteConfirmationModal } from "@/modals/delete.confirmation";
import { RenameCollectionModal } from "@/modals/rename.collection";
import { AppService } from "@/services";
import { GurlRequestItem } from "./collection.request.item";

@Component({
	selector: `div[gurl-collection-item]`,
	template: `
    <div class="flex items-center gap-2 p-2 bg-base-300 rounded box basis-">
      <div
        class="flex flex-1 items-center gap-2"
      >
        <div
          [ngClass]="{
            'text-primary': data().id !== defaultCollectionID
          }"
        >
          <lucide-angular [img]="CollectionsIcon" class="size-4" />
        </div>
        <p class="flex-1 text-sm truncate">{{ data().name }}</p>
	  </div>
	  <button class="btn btn-sm btn-square btn-ghost" (click)="toggleOpen()">
			@if(isOpen()) {
        		<lucide-angular [img]="CloseIcon" class="size-4" />
       		 }@else {
        		<lucide-angular [img]="OpenIcon" class="size-4" />
       	 }
	  </button>
      <div class="dropdown dropdown-end">
        <button tabindex="0" class="btn btn-sm btn-square btn-ghost" [disabled]="data().id === defaultCollectionID && requestItems().length == 0">
          <lucide-angular [img]="CollectionOptionsIcon" class="size-4" />
        </button>
        <ul
          tabindex="-1"
          class="dropdown-content menu bg-base-100 rounded-box z-50 w-max shadow-sm"
        >
          @if(data().id === defaultCollectionID) {
           	<li>
              <button role="link" (click)="toggleClearModal()">
				<lucide-angular [img]="ClearIcon" class="size-4" />
				Clear
			</button>
            </li>
			<li>
              <button role="link" (click)="appSvc.exportCollection(data().id)">
				<lucide-angular [img]="ExportIcon" class="size-4" />
				Export
			</button>
            </li>
          } 
          @else {
             <li class="my-0.5">
              <button role="link" (click)="toggleRenameModal()"> 
					<lucide-angular [img]="RenameIcon" class="size-4" />
				Rename 
			 </button>
            </li>
			@if(requestItems().length){
				<li>
					
              		<button role="link" (click)="toggleClearModal()">
						<lucide-angular [img]="ClearIcon" class="size-4" />
						Clear
					</button>
            	</li>
				<li>
					<button role="link" (click)="appSvc.exportCollection(data().id)">
						<lucide-angular [img]="ExportIcon" class="size-4" />
						Export
					</button>
            	</li>
			}
            <li>
              <button role="link" (click)="toggleDeleteModal()">
				<lucide-angular [img]="DeleteIcon" class="size-4" />	
			  	Delete
			 </button>
            </li>
            }
        </ul>
      </div>
    </div>
    <dialog gurl-rm-confirmation-modal
    [title]="deleteModalTitle()"
    [message]="deleteModalMessage()"
    [isOpen]="isDeleteModalOpen()"
    [actionInProgress]="delInProgress()"
    (onCancel)="handleCancelDeletion()"
    (onConfirm)="handleConfirmDeletion()"
    >
    </dialog>
	<dialog gurl-rm-confirmation-modal
    [title]="clearModalTitle()"
    [message]="clearModalMessage()"
    [isOpen]="isClearModalOpen()"
    [actionInProgress]="clearInProgress()"
    (onCancel)="handleCancelClear()"
    (onConfirm)="handleConfirmClear()"
    >
    </dialog>
    @if(isRenameModalOpen()){
      <dialog  gurl-rename-collection-modal
      [initialValue]="data().name"
      [isOpen]="isRenameModalOpen()"
      [actionInProgress]="mvInProgress()"
      (onCancel)="handleCancelRename()"
      (onConfirm)="handleConfirmRename($event)"
      >
    </dialog>
    }
    @if(isOpen()) {
    <section class="flex flex-col gap-1">
      @if (requestItems().length) { @for (item of requestItems(); track item.id) {
      <div gurl-request-item [data]="item"></div>
      } } @else {
      <div class="flex items-center gap-2 my-2 justify-center text-sm opacity-25">
        <lucide-angular [img]="EmptyIcon" class="size-4" />
		No items
      </div>
      }
    </section>
    }
  `,
	imports: [
		LucideAngularModule,
		GurlRequestItem,
		NgClass,
		RenameCollectionModal,
		DeleteConfirmationModal,
	],
})
export class GurlCollectionItem {
	@HostBinding("class")
	def = "flex flex-col gap-1";

	data = input.required<models.CollectionDTO>();

	protected readonly appSvc = inject(AppService);
	protected readonly CollectionsIcon = Layers;
	protected readonly CollectionOptionsIcon = EllipsisVertical;
	protected readonly EmptyIcon = Ban;
	protected readonly ExportIcon = FileDown;
	protected readonly OpenIcon = ChevronDown;
	protected readonly CloseIcon = ChevronUp;
	protected readonly ClearIcon = Eraser;
	protected readonly RenameIcon = SquarePen;
	protected readonly DeleteIcon = Trash2;
	protected readonly defaultCollectionID = DEFAULT_COLLECTION_ID;

	protected readonly deleteModalTitle = computed(() => {
		return `Delete Collection "${this.data().name}" ?`;
	});

	protected readonly clearModalTitle = computed(() => {
		return `Clear Collection "${this.data().name}" ?`;
	});

	protected readonly clearModalMessage = computed(() => {
		const reqCount = this.appSvc
			.savedRequests()
			.filter((x) => x.collectionId === this.data().id).length;
		return `${reqCount} requests under collection will be deleted.`;
	});

	protected readonly deleteModalMessage = computed(() => {
		const reqCount = this.appSvc
			.savedRequests()
			.filter((x) => x.collectionId === this.data().id).length;
		return `Collection along with ${reqCount} requests will be deleted.`;
	});

	protected isDeleteModalOpen = signal<boolean>(false);
	protected delInProgress = signal<boolean>(false);

	protected mvInProgress = signal<boolean>(false);
	protected isRenameModalOpen = signal<boolean>(false);

	protected isClearModalOpen = signal<boolean>(false);
	protected clearInProgress = signal<boolean>(false);

	protected toggleRenameModal() {
		this.isRenameModalOpen.update((x) => !x);
		const activeEl = document.activeElement as HTMLElement;
		activeEl?.blur();
	}

	protected toggleDeleteModal() {
		this.isDeleteModalOpen.update((x) => !x);
		const activeEl = document.activeElement as HTMLElement;
		activeEl?.blur();
	}

	protected toggleClearModal() {
		this.isClearModalOpen.update((x) => !x);
		const activeEl = document.activeElement as HTMLElement;
		activeEl?.blur();
	}

	protected async handleConfirmClear() {
		this.clearInProgress.set(true);
		console.log(`collection # ${this.data().id} will be cleared`);
		await this.appSvc.clearCollection(this.data().id);
		this.clearInProgress.set(false);
		this.toggleClearModal();
	}

	protected handleCancelClear() {
		this.toggleClearModal();
	}

	protected async handleConfirmDeletion() {
		this.delInProgress.set(true);
		console.log(`collection # ${this.data().id} will be nuked`);
		await this.appSvc.deleteCollection(this.data().id);
		this.delInProgress.set(false);
		this.toggleDeleteModal();
	}

	protected handleCancelDeletion() {
		this.toggleDeleteModal();
	}

	protected async handleConfirmRename(newName: string) {
		this.mvInProgress.set(true);
		console.log(
			`collection # ${this.data().id} will be  renamed to ${newName}`,
		);
		await this.appSvc.renameCollection(this.data().id, newName);
		this.mvInProgress.set(false);
		this.toggleRenameModal();
	}

	protected handleCancelRename() {
		this.toggleRenameModal();
	}

	protected isOpen = signal<boolean>(false);

	protected toggleOpen() {
		this.isOpen.update((x) => !x);
	}

	protected requestItems = computed<models.RequestDTO[]>(() =>
		this.appSvc
			.savedRequests()
			.filter((x) => x.collectionId === this.data().id),
	);
}
