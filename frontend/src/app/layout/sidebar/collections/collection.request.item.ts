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
	Copy,
	EllipsisVertical,
	LucideAngularModule,
	Trash2,
} from "lucide-angular";
import { CopyRequestModal } from "@/modals/copy.request";
import { DeleteConfirmationModal } from "@/modals/delete.confirmation";
import { ReqMethodTag } from "@/request/method.tag";
import { AppService, TabsService } from "@/services";

@Component({
	selector: `div[collectionRequestItem]`,
	template: `
    <div class="flex flex-col gap-2 p-2">
	  <div class="flex items-center">
			<div class="flex-1 flex items-center flex-nowrap gap-2 overflow-hidden">
				<div methodTag [size]="'xs'" [method]="data().method"></div>
				<a href="#" class="block focus:underline focus:outline-0 flex-1 text-sm truncate" (click)="handleOpenRequest()">
					{{ data().name }}
				</a>
	 		 </div>
			<div class="dropdown dropdown-end" data-el="req-options-btn">
				<button tabindex="0" class="btn btn-sm btn-square btn-ghost">
				<lucide-angular [img]="RequestOptsIcon" class="size-4" />
				</button>
			<ul
			tabindex="-1"
			class="dropdown-content menu bg-base-100 rounded-box z-50 w-max shadow-sm"
			>
				<li class="my-0.5">
					<a href="#" (click)="toggleCopyModal()">
						<lucide-angular [img]="CopyIcon" class="size-4"  /> 
						Copy 
					</a>
				</li>
				<li>
					<a href="#" (click)="toggleDeleteModal()">
						<lucide-angular [img]="DeleteIcon" class="size-4" /> 
						Delete
					</a>
				</li>
			</ul>
	  		</div>
	  </div>
      <p class="text-sm truncate opacity-50">
        {{ data().url }}
      </p>
    </div>
	@if(this.isDeleteModalOpen()) {
      <dialog rmModal
        [title]="deleteTitle()"
        [message]="deleteMessage"
        [isOpen]="isDeleteModalOpen()"
        [actionInProgress]="isDeletionInProgress()"
        (onCancel)="handleCancelDeletion()"
        (onConfirm)="handleConfirmDeletion()"
      ></dialog>
    }
	@if(this.isCopyModalOpen()) {
      <dialog cpRequestModal
        [initialValue]="data().name + '-copy'"
        [isOpen]="isCopyModalOpen()"
        [actionInProgress]="isCopyInProgress()"
        (onCancel)="handleCancelCopy()"
        (onConfirm)="handleConfirmCopy($event)"
      ></dialog>
    }
  `,
	imports: [
		ReqMethodTag,
		LucideAngularModule,
		DeleteConfirmationModal,
		CopyRequestModal,
	],
})
export class CollectionRequest {
	data = input.required<models.RequestDTO>();
	tabSvc = inject(TabsService);
	appSvc = inject(AppService);

	readonly RequestOptsIcon = EllipsisVertical;
	readonly DeleteIcon = Trash2;
	readonly CopyIcon = Copy;

	readonly deleteTitle = computed(
		() => `Delete Request '${this.data().name}' ?`,
	);
	readonly deleteMessage = `This action is irreversible`;

	@HostBinding("class")
	def = "border-2 border-base-100 shadow-md rounded-box";

	handleOpenRequest() {
		this.tabSvc.createTabFromSaved(this.data());
		const parentTarget = document.activeElement as HTMLAnchorElement;
		parentTarget.blur();
	}

	isDeleteModalOpen = signal<boolean>(false);
	isDeletionInProgress = signal<boolean>(false);

	toggleDeleteModal() {
		this.isDeleteModalOpen.update((x) => !x);
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
	}

	isCopyModalOpen = signal<boolean>(false);
	isCopyInProgress = signal<boolean>(false);

	toggleCopyModal() {
		this.isCopyModalOpen.update((x) => !x);
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
	}

	async handleConfirmCopy(name: string) {
		this.isCopyInProgress.set(true);
		await this.appSvc.copyRequest(this.data().id, name);
		this.isCopyInProgress.set(false);
		this.toggleCopyModal();
	}

	handleCancelCopy() {
		this.toggleCopyModal();
	}

	async handleConfirmDeletion() {
		this.isDeletionInProgress.set(true);
		this.appSvc.deleteRequest(this.data().id);
		this.isDeletionInProgress.set(false);
		this.toggleDeleteModal();
	}

	handleCancelDeletion() {
		this.toggleDeleteModal();
	}
}
