import { Component, HostBinding, inject, input } from "@angular/core";
import type { models } from "@wailsjs/go/models";
import { SystemIconComponent } from "@/common/components/icon";
import { ReqMethodTag } from "@/request/method.tag";
import { GlobalModalsService, TabsService } from "@/services";

@Component({
	selector: `div[gurl-request-item]`,
	template: `
    <div class="flex flex-col gap-2 p-2">
	  <div class="flex items-center">
			<div class="flex-1 flex items-center flex-nowrap gap-2 overflow-hidden">
				 <i gurl-icon [icon]="'Request'" [className]="'size-4'" ></i>
				<div gurl-req-tag [size]="'xs'" [method]="data().method"></div>
				<a class="block hover:cursor-pointer focus:underline focus:outline-0 flex-1 text-sm truncate" (click)="handleOpenRequest()">
					{{ data().name }}
				</a>
	 		 </div>
			<div class="dropdown dropdown-end" data-el="req-options-btn">
				<button tabindex="0" class="btn btn-sm btn-square btn-ghost">
				<i gurl-icon [icon]="'Options'" [className]="'size-4'" ></i>
				</button>
			<ul
			tabindex="-1"
			class="dropdown-content menu bg-base-100 rounded-box z-50 w-max shadow-sm"
			>
				<li class="my-0.5">
					<a (click)="toggleCopyModal()">
						<i gurl-icon [icon]="'Copy'" [className]="'size-4'" ></i>
						Copy 
					</a>
				</li>
				<li>
					<a (click)="toggleDeleteModal()">
						<i gurl-icon [icon]="'Delete'" [className]="'size-4'" ></i> 
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
	imports: [ReqMethodTag, SystemIconComponent],
})
export class GurlRequestItem {
	@HostBinding("class")
	def = "border-2 border-base-100 shadow-md rounded-box";

	data = input.required<models.RequestLightDTO>();

	private readonly tabSvc = inject(TabsService);
	private readonly modalsSvc = inject(GlobalModalsService);

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
