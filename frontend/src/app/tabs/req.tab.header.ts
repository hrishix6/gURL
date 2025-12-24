import {
	Component,
	HostBinding,
	HostListener,
	inject,
	input,
	output,
} from "@angular/core";
import { LucideAngularModule, X } from "lucide-angular";
import { TabsService } from "../services";
import type { ApplicationTab } from "../../types";
import { ReqMethodTag } from "../request/method.tag";

@Component({
	selector: `div[appReqTabHeader]`,
	template: `
    <div class="flex flex-1 items-center gap-1 overflow-hidden">
      <!-- <div class="badge badge-soft badge-primary badge-xs">{{ data().tag }}</div> -->
      <div methodTag [size]="'xs'" [method]="data().tag"></div>
      <p class="truncate">
        {{ data().name }}
      </p>
    </div>
    <button
      class="btn btn-ghost btn-square btn-xs hover:bg-base-200"
      (click)="handleClose()"
      [disabled]="tabSvc.tabCount() === 1"
    >
      <lucide-angular [img]="CancelIcon" class="size-3" />
    </button>
  `,
	imports: [LucideAngularModule, ReqMethodTag],
})
export class TabHeader {
	readonly CancelIcon = X;
	isActive = input.required<boolean>();
	data = input.required<ApplicationTab>();
	onCloseTab = output();
	onSelectTab = output();
	tabSvc = inject(TabsService);

	@HostBinding("class") get def() {
		const defaults = [
			"flex",
			"p-2",
			"justify-between",
			"hover:cursor-pointer",
			"hover:bg-base-100",
			"items-center",
			"basis-56",
			"grow-0",
			"shrink-0",
			"overflow-hidden",
			"text-xs",
		];

		if (this.isActive()) {
			return [...defaults, "bg-base-100", "border-t-2", "border-primary"].join(
				" ",
			);
		}

		return [...defaults, "bg-base-300", "border-1", "border-base-200"].join(
			" ",
		);
	}

	handleClose() {
		this.onCloseTab.emit();
	}

	@HostListener("click")
	handleActivation() {
		this.onSelectTab.emit();
	}
}
