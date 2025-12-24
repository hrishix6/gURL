import { Component, HostBinding, inject, signal } from "@angular/core";
import { LucideAngularModule, Search } from "lucide-angular";
import { AppService } from "../../../services";
import { CollectionList } from "./collection.item";

@Component({
	selector: `app-collections`,
	template: `
    <div class="px-2 pt-2">
      <label class="input input-ghost input-primary bg-base-300">
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
    <section class="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
      @for (collection of appSvc.collections(); track collection.id) {
      <div collectionItem [data]="collection" role="button"></div>
      }
    </section>
  `,
	imports: [LucideAngularModule, CollectionList],
})
export class AppCollectionsSidebar {
	readonly SearchIcon = Search;
	@HostBinding("class")
	def = "flex-1 flex flex-col overflow-hidden";
	readonly appSvc = inject(AppService);

	searchInput = signal<string>("");

	handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		this.searchInput.set(target.value);
		this.appSvc.collectionSearchKeyChange$.next(target.value);
	}
}
