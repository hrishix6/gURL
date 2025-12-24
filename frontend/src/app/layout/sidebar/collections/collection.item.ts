import { NgClass } from "@angular/common";
import {
	Component,
	computed,
	HostBinding,
	inject,
	input,
	signal,
} from "@angular/core";
import {
	Ban,
	ChevronDown,
	ChevronUp,
	Ellipsis,
	Layers,
	LucideAngularModule,
} from "lucide-angular";
import type { models } from "../../../../../wailsjs/go/models";
import { DEFAULT_COLLECTION_ID } from "../../../../constants";
import { AppService } from "../../../services";
import { CollectionRequest } from "./collection.request.item";

@Component({
	selector: `div[collectionItem]`,
	template: `
    <div class="flex items-center gap-1">
      <a
        href="#"
        role="link"
        class="flex flex-1 items-center focus:ring-2 focus:outline-none focus:ring-primary rounded-box gap-2 overflow-hidden hover:bg-base-300 hover:cursor-pointer p-2"
        (click)="toggleOpen()"
      >
        <div
          [ngClass]="{
            'text-primary': data().id !== defaultCollectionID
          }"
        >
          <lucide-angular [img]="CollectionsIcon" class="size-4" />
        </div>
        <p class="flex-1 text-sm truncate">{{ data().name }}</p>
        @if(isOpen()) {
        <lucide-angular [img]="CloseIcon" class="size-4" />
        }@else {
        <lucide-angular [img]="OpenIcon" class="size-4" />
        }
      </a>
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-xs btn-square btn-ghost">
          <lucide-angular [img]="CollectionOptionsIcon" class="size-4" />
        </div>
        <ul
          tabindex="-1"
          class="dropdown-content menu bg-base-200 rounded-box z-50 w-max shadow-sm"
        >
          <li class="my-0.5">
            <button role="link"> Rename </button>
          </li>
          <li>
            <button role="link"> Export </button>
          </li>
          <li>
            <button role="link"> Delete </button>
          </li>
        </ul>
      </div>
    </div>
    @if(isOpen()) {
    <section class="flex flex-col gap-1">
      @if (requestItems().length) { @for (item of requestItems(); track item.id) {
      <a href="#" role="link" collectionRequestItem [data]="item"></a>
      } } @else {
      <div class="flex items-center gap-2 justify-center text-sm opacity-25">
        <lucide-angular [img]="EmptyIcon" class="size-4" />
      </div>
      }
    </section>
    }
  `,
	imports: [LucideAngularModule, CollectionRequest, NgClass],
})
export class CollectionList {
	readonly CollectionsIcon = Layers;
	readonly CollectionOptionsIcon = Ellipsis;
	readonly EmptyIcon = Ban;
	readonly OpenIcon = ChevronDown;
	readonly CloseIcon = ChevronUp;

	readonly defaultCollectionID = DEFAULT_COLLECTION_ID;

	appSvc = inject(AppService);

	isOpen = signal<boolean>(false);

	toggleOpen() {
		this.isOpen.update((x) => !x);
	}

	requestItems = computed<models.RequestDTO[]>(() =>
		this.appSvc
			.savedRequests()
			.filter((x) => x.collectionId === this.data().id),
	);

	data = input.required<models.CollectionDTO>();

	@HostBinding("class")
	def = "flex flex-col gap-2";
}
