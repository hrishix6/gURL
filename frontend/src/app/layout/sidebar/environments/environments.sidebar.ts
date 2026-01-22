import { Component, HostBinding, inject, signal } from "@angular/core";
import { Ban, LucideAngularModule, Search } from "lucide-angular";
import { AppService } from "@/services";
import { EnvironmentItem } from "./environment.item";

@Component({
	selector: `div[gurlEnvironments]`,
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
    @if (appSvc.environments().length) {
    <div class="flex-1 flex flex-col overflow-y-auto gap-1 p-2">
      @for (item of appSvc.environments(); track item.id) {
       <div
       [data]="item"
       environmentItem
       >
       </div>
      }
    </div>
    }@else {
    <div class="flex items-center gap-2 my-2 justify-center text-sm opacity-25">
        <lucide-angular [img]="NoneIcon" class="size-4" />
		    No items
      </div>
    }
  `,
	imports: [LucideAngularModule, EnvironmentItem],
})
export class EnvironmentSidebar {
	readonly NoneIcon = Ban;
	readonly SearchIcon = Search;

	appSvc = inject(AppService);

	@HostBinding("class")
	def = "flex flex-1 flex-col overflow-hidden";

	searchInput = signal<string>("");

	handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		this.searchInput.set(target.value);
		this.appSvc.envSearchKeyChange$.next(target.value);
	}
}
