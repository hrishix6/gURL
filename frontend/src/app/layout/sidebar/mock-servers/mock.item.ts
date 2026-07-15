import { Component, HostBinding, inject, input, output } from "@angular/core";
import type { models } from "@wailsjs/go/models";
import { SystemIconComponent } from "@/common/components/icon";
import { ReqMethodTag } from "@/request/method.tag";
import { AppService, GlobalModalsService, TabsService } from "@/services";

@Component({
	selector: `div[gurl-mock-item]`,
	template: `
    <div class="flex flex-col gap-2 p-2">
	  <div class="flex items-center">
			<div class="flex-1 flex items-center flex-nowrap gap-2 overflow-hidden">
				<i gurl-icon [icon]="'Mock'" [className]="'size-4'" ></i>
				<div gurl-req-tag [size]="'xs'" [method]="data().method"></div>
				<a  role="link" class="block focus:underline focus:outline-0 hover:cursor-pointer flex-1 text-sm truncate" (click)="handleOpenMockDraft()">
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
                    <li>
                        <a role="link" (click)="handleOpenMockItemInfo()">
                            <i gurl-icon [icon]="'Info'" [className]="'size-4'" ></i>
                            Info
                        </a>
                    </li>
					 <li>
                        <a role="link" (click)="handleCopyMockItem()">
                            <i gurl-icon [icon]="'Copy'" [className]="'size-4'" ></i>
                            Copy
                        </a>
                    </li>
                    <li>
                        <a role="link" (click)="toggleDeleteModal()">
                            <i gurl-icon [icon]="'Delete'" [className]="'size-4'" ></i> 
                            Delete
                        </a>
                    </li>
                </ul>
	  		</div>
	  </div>
      <p class="text-sm truncate opacity-50">
        {{ data().path }}
      </p>
    </div>
  `,
	imports: [ReqMethodTag, SystemIconComponent],
})
export class GurlMockItem {
	@HostBinding("class")
	def = "border-2 border-base-100 shadow-md rounded-box";

	data = input.required<models.MockLightDTO>();
	onShowInfo = output<{ id: string; path: string }>();
	private readonly tabSvc = inject(TabsService);
	private readonly modalsSvc = inject(GlobalModalsService);
	private readonly appSvc = inject(AppService);

	protected handleOpenMockDraft() {
		this.tabSvc.createMockTabFromSaved(this.data());
		const parentTarget = document.activeElement as HTMLAnchorElement;
		parentTarget.blur();
	}

	protected toggleDeleteModal() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.modalsSvc.handleOpenDeleteMockModal(this.data());
	}

	protected handleOpenMockItemInfo() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.onShowInfo.emit({ id: this.data().id, path: this.data().path });
	}

	protected handleCopyMockItem() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.appSvc.copyMock(this.data().id);
	}
}
