import {
	Component,
	HostBinding,
	HostListener,
	inject,
	input,
} from "@angular/core";
import type { models } from "../../../../../wailsjs/go/models";
import { TabsService } from "../../../services";
import { ReqMethodTag } from "../../../request/method.tag";

@Component({
	selector: `a[collectionRequestItem]`,
	template: `
    <div class="flex flex-col gap-2 overflow-hidden p-2">
      <div class="flex items-center flex-nowrap gap-2 overflow-hidden">
        <div methodTag [size]="'xs'" [method]="data().method"></div>
        <p class="flex-1 text-xs truncate">
          {{ data().name }}
        </p>
      </div>
      <p class="text-xs text-gray-400 truncate">
        {{ data().url }}
      </p>
    </div>
  `,
	imports: [ReqMethodTag],
})
export class CollectionRequest {
	data = input.required<models.RequestDTO>();
	tabSvc = inject(TabsService);

	@HostBinding("class")
	def =
		"bg-base-300 rounded-box hover:bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary hover:cursor-pointer transition-all delay-50 ease-in-out";

	@HostListener("click")
	handleClick() {
		this.tabSvc.createTabFromSaved(this.data());
		const target = document.activeElement as HTMLAnchorElement;
    	target.blur();
	}
}
