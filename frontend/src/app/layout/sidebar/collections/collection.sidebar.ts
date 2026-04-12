import { Component, HostBinding, inject, signal } from "@angular/core";
import { CirclePlus, Info, LucideAngularModule, Search } from "lucide-angular";
import { AppService, GlobalModalsService } from "@/services";
import { GurlCollectionItem } from "./collection.item";

@Component({
	selector: `gurl-collections`,
	template: `
    <div class="px-2 pt-2">
      <label class="input input-ghost w-full input-primary bg-base-300">
        <lucide-angular [img]="SearchIcon" class="size-4" />
        <input
          type="search"
          required
          placeholder="Search"
          [value]="searchInput()"
          (input)="handleInput($event)"
        />
      </label>
    </div>
    @if (appSvc.collections().length) {
    <section class="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
      @for (collection of appSvc.collections(); track collection.id) {
      <div gurl-collection-item [data]="collection" role="button"></div>
      }
    </section>
    } @else {
      <div class="flex-1 flex flex-col justify-center items-center">
          <div class="flex flex-col gap-2 opacity-30">
            <button class="btn btn-lg btn-ghost"  (click)="handleOpenAddCollectionModal()">
                  <lucide-angular [img]="AddIcon" class="size-8" />
                  <span class="text-lg">Collection</span>
            </button>
           </div>
      </div>
    }
  `,
	imports: [LucideAngularModule, GurlCollectionItem],
})
export class GurlCollections {
	@HostBinding("class")
	def = "flex-1 flex flex-col overflow-hidden";

	protected readonly SearchIcon = Search;
	protected readonly appSvc = inject(AppService);
	protected searchInput = signal<string>("");
	protected readonly InfoIcon = Info;
	protected readonly AddIcon = CirclePlus;
	private readonly modalsSvc = inject(GlobalModalsService);

	protected handleOpenAddCollectionModal() {
		this.modalsSvc.handleOpenCreateCollectionModal();
	}

	protected handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		this.searchInput.set(target.value);
		this.appSvc.collectionSearchKeyChange$.next(target.value);
	}
}
