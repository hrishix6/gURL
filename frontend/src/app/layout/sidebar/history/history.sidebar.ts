import { Component, HostBinding, inject, signal } from "@angular/core";
import { Ban, LucideAngularModule, Search } from "lucide-angular";
import { AppService } from "@/services";
import { GurlHistoryItem } from "./history.item";

@Component({
	selector: `gurl-history`,
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
    @if (appSvc.historyItems().length) {
    <div class="flex-1 flex flex-col overflow-y-auto gap-1 p-2">
      @for (item of appSvc.historyItems(); track item.id) {
      <a href="#" role="button" [data]="item" gurl-history-item></a>
      }
    </div>
    }@else {
    <div class="flex items-center gap-2 my-2 justify-center text-sm opacity-25">
        <lucide-angular [img]="NoneIcon" class="size-4" />
		    No items
      </div>
    }
  `,
	imports: [GurlHistoryItem, LucideAngularModule],
})
export class GurlReqHistory {
	@HostBinding("class")
	def = "flex flex-1 flex-col overflow-hidden";

	protected readonly NoneIcon = Ban;
	protected readonly SearchIcon = Search;

	protected readonly appSvc = inject(AppService);

	protected searchInput = signal<string>("");

	protected handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		this.searchInput.set(target.value);
		this.appSvc.searchHistoryKeyChange$.next(target.value);
	}
}
