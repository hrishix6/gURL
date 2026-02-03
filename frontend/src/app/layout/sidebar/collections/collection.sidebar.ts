import { Component, HostBinding, inject, signal } from "@angular/core";
import { LucideAngularModule, Search } from "lucide-angular";
import { AppService } from "@/services";
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
    <section class="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
      @for (collection of appSvc.collections(); track collection.id) {
      <div gurl-collection-item [data]="collection" role="button"></div>
      }
    </section>
  `,
	imports: [LucideAngularModule, GurlCollectionItem],
})
export class GurlCollections {
	@HostBinding("class")
	def = "flex-1 flex flex-col overflow-hidden";

	protected readonly SearchIcon = Search;
	protected readonly appSvc = inject(AppService);
	protected searchInput = signal<string>("");

	protected handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		this.searchInput.set(target.value);
		this.appSvc.collectionSearchKeyChange$.next(target.value);
	}
}
