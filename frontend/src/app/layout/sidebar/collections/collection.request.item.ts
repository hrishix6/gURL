import { Component, HostBinding, inject, input } from "@angular/core";
import type { models } from "@wailsjs/go/models";
import {
	Copy,
	EllipsisVertical,
	LucideAngularModule,
	Trash2,
} from "lucide-angular";
import { ReqMethodTag } from "@/request/method.tag";
import { TabsService } from "@/services";
import { GlobalModalsService } from "@/services/modals.service";

@Component({
	selector: `div[gurl-request-item]`,
	template: `
    <div class="flex flex-col gap-2 p-2">
	  <div class="flex items-center">
			<div class="flex-1 flex items-center flex-nowrap gap-2 overflow-hidden">
				<div gurl-req-tag [size]="'xs'" [method]="data().method"></div>
				<a href="#" class="block focus:underline focus:outline-0 flex-1 text-sm truncate" (click)="handleOpenRequest()">
					{{ data().name }}
				</a>
	 		 </div>
			<div class="dropdown dropdown-end" data-el="req-options-btn">
				<button tabindex="0" class="btn btn-sm btn-square btn-ghost">
				<lucide-angular [img]="RequestOptsIcon" class="size-4" />
				</button>
			<ul
			tabindex="-1"
			class="dropdown-content menu bg-base-100 rounded-box z-50 w-max shadow-sm"
			>
				<li class="my-0.5">
					<a href="#" (click)="toggleCopyModal()">
						<lucide-angular [img]="CopyIcon" class="size-4"  /> 
						Copy 
					</a>
				</li>
				<li>
					<a href="#" (click)="toggleDeleteModal()">
						<lucide-angular [img]="DeleteIcon" class="size-4" /> 
						Delete
					</a>
				</li>
			</ul>
	  		</div>
	  </div>
      <p class="text-sm truncate opacity-50">
        {{ data().url }}
      </p>
    </div>
  `,
	imports: [ReqMethodTag, LucideAngularModule],
})
export class GurlRequestItem {
	@HostBinding("class")
	def = "border-2 border-base-100 shadow-md rounded-box";

	data = input.required<models.RequestDTO>();

	private readonly tabSvc = inject(TabsService);
	private readonly modalsSvc = inject(GlobalModalsService);

	protected readonly RequestOptsIcon = EllipsisVertical;
	protected readonly DeleteIcon = Trash2;
	protected readonly CopyIcon = Copy;

	protected handleOpenRequest() {
		this.tabSvc.createTabFromSaved(this.data());
		const parentTarget = document.activeElement as HTMLAnchorElement;
		parentTarget.blur();
	}

	protected toggleDeleteModal() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.modalsSvc.handleOpenDeleteReqModal(this.data());
	}

	protected toggleCopyModal() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.modalsSvc.handleOpenCopyReqModal(this.data());
	}
}
