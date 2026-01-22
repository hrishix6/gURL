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
	Container,
	EllipsisVertical,
	LucideAngularModule,
	Trash2,
} from "lucide-angular";
import { DeleteConfirmationModal } from "@/modals/delete.confirmation";
import { AppService, TabsService } from "@/services";

@Component({
	selector: `div[environmentItem]`,
	template: `
    <div class="flex items-center gap-2 p-2 bg-base-300 rounded box">
      <a
         href="#"
         role="button"
         class="flex flex-1 items-center gap-2 focus:outline-0 focus:underline"
         (click)="openEnvironmentTab()"
      > 
            <div class="text-primary">
            <lucide-angular [img]="EnvironmentIcon" class="size-4" />
            </div>
            <p class="flex-1 text-sm truncate">{{ data().name }}</p>
        </a>
      <div class="dropdown dropdown-end">
        <button tabindex="0" class="btn btn-sm btn-square btn-ghost">
          <lucide-angular [img]="EnvironmentOptionsIcon" class="size-4" />
        </button>
        <ul
          tabindex="-1"
          class="dropdown-content menu bg-base-100 rounded-box z-50 w-max shadow-sm"
        >
            <li>
              <a href="#" role="link" (click)="toggleDeleteModal()">
				      <lucide-angular [img]="DeleteIcon" class="size-4" />	
			  	    Delete
              </a>
            </li>
        </ul>
      </div>
    </div>
    @if(this.isDeleteModalOpen()) {
      <dialog rmModal
        [title]="deleteModalTitle()"
        [message]="deleteModalMessage"
        [isOpen]="isDeleteModalOpen()"
        [actionInProgress]="delInProgress()"
        (onCancel)="handleCancelDeletion()"
        (onConfirm)="handleConfirmDeletion()"
      ></dialog>
    }
  `,
	imports: [LucideAngularModule, DeleteConfirmationModal],
})
export class EnvironmentItem {
	readonly EnvironmentIcon = Container;
	readonly EnvironmentOptionsIcon = EllipsisVertical;
	readonly DeleteIcon = Trash2;

	readonly tabSvc = inject(TabsService);
	readonly appSvc = inject(AppService);

	openEnvironmentTab() {
		this.tabSvc.createEnvTabFromSaved(this.data());
	}

	data = input.required<models.EnvironmentDTO>();

	@HostBinding("class")
	def = "flex flex-col gap-1";

	readonly deleteModalTitle = computed(() => {
		return `Delete Environment "${this.data().name}" ?`;
	});

	readonly deleteModalMessage =
		"This action is irreversible, environment along with all secrets will be deleted.";

	isDeleteModalOpen = signal<boolean>(false);
	delInProgress = signal<boolean>(false);

	toggleDeleteModal() {
		this.isDeleteModalOpen.update((x) => !x);
	}

	async handleConfirmDeletion() {
		this.delInProgress.set(true);
		await this.appSvc.DeleteEnv(this.data().id);
		this.delInProgress.set(false);
		this.toggleDeleteModal();
	}

	handleCancelDeletion() {
		this.toggleDeleteModal();
	}
}
