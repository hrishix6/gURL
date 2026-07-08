import { Component, inject } from "@angular/core";
import { SystemIconComponent } from "@/common/components/icon";
import { AppService } from "@/services";
import { GurlEnvironmentItem } from "./environment.item";

@Component({
	selector: `gurl-environments`,
	template: `
    @if (appSvc.environments().length) {
    <div class="flex-1 flex flex-col overflow-y-auto gap-1 p-2">
      @for (item of appSvc.environments(); track item.id) {
       <div
       gurl-environment-item
       [data]="item"
       >
       </div>
      }
    </div>
    }@else {
    <div class="flex items-center gap-2 my-2 justify-center text-sm opacity-25">
                    <i gurl-icon [icon]="'Empty'" [className]="'size-4'" ></i>
                    No items
    </div>
    }
  `,
	imports: [GurlEnvironmentItem, SystemIconComponent],
})
export class GurlEnvironments {
	protected appSvc = inject(AppService);
}
