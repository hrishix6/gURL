import { Component, inject } from "@angular/core";
import { SystemIconComponent } from "@/common/components/icon";
import { AppService } from "@/services";
import { GurlHistoryItem } from "./history.item";

@Component({
	selector: `gurl-history`,
	template: `
    @if (appSvc.historyItems().length) {
    <div class="flex-1 flex flex-col overflow-y-auto gap-1 p-2">
      @for (item of appSvc.historyItems(); track item.id) {
      <a href="#" role="button" [data]="item" gurl-history-item></a>
      }
    </div>
    }@else {
    <div class="flex items-center gap-2 my-2 justify-center text-sm opacity-25">
        <i gurl-icon [icon]="'Empty'" [className]="'size-4'" ></i>
        No items
    </div>
    }
  `,
	imports: [GurlHistoryItem, SystemIconComponent],
})
export class GurlReqHistory {
	protected readonly appSvc = inject(AppService);
}
