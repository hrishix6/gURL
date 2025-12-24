import { Component, HostBinding, inject, signal } from "@angular/core";
import { Ban, LucideAngularModule, Search } from "lucide-angular";
import { AppService } from "../../../services";
import { RequestHistoryItem } from "./history.item";

@Component({
	selector: `div[gurlReqHistory]`,
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
    @if (appSvc.historyItems().length) {
    <div class="flex-1 flex flex-col overflow-y-auto gap-2 p-2">
      @for (item of appSvc.historyItems(); track item.id) {
      <div [data]="item" gurlReqHistoryItem></div>
      }
    </div>
    }@else {
    <div class="flex items-center gap-2 justify-center opacity-25">
      <lucide-angular [img]="NoneIcon" class="size-4" />
    </div>
    }
  `,
	imports: [RequestHistoryItem, LucideAngularModule],
})
export class AppRequestHistory {
	readonly NoneIcon = Ban;
	readonly SearchIcon = Search;

	appSvc = inject(AppService);

	@HostBinding("class")
	def = "flex flex-1 flex-col gap-2 overflow-hidden";

	searchInput = signal<string>("");

	handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		this.searchInput.set(target.value);
		this.appSvc.searchHistoryKeyChange$.next(target.value);
	}
}
