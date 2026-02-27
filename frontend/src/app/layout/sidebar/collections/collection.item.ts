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
import { AppService, GlobalModalsService } from "@/services";
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
              <button role="link" (click)="toggleExportDialogue()">
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
					<button role="link" (click)="toggleExportDialogue()">
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
	imports: [LucideAngularModule, GurlRequestItem, NgClass],
})
export class GurlCollectionItem {
	@HostBinding("class")
	def = "flex flex-col gap-1";

	data = input.required<models.CollectionDTO>();

	protected readonly appSvc = inject(AppService);
	protected readonly modalsSvc = inject(GlobalModalsService);
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

	protected toggleRenameModal() {
		const activeEl = document.activeElement as HTMLElement;
		activeEl?.blur();
		this.modalsSvc.handleOpenRenameCollectionModal(this.data());
	}

	protected toggleExportDialogue() {
		const activeEl = document.activeElement as HTMLElement;
		activeEl?.blur();
		this.appSvc.exportCollection(this.data().id);
	}

	protected toggleDeleteModal() {
		const activeEl = document.activeElement as HTMLElement;
		activeEl?.blur();
		this.modalsSvc.handleOpenDeleteCollectionModal(this.data());
	}

	protected toggleClearModal() {
		const activeEl = document.activeElement as HTMLElement;
		activeEl?.blur();
		this.modalsSvc.handleOpenClearCollectionModal(this.data());
	}

	protected isOpen = signal<boolean>(false);

	protected toggleOpen() {
		this.isOpen.update((x) => !x);
	}

	protected requestItems = computed<models.RequestLightDTO[]>(() =>
		this.appSvc
			.savedRequests()
			.filter((x) => x.collectionId === this.data().id),
	);
}
