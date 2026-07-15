import { NgClass } from "@angular/common";
import { Component, HostBinding, inject, input } from "@angular/core";
import type { models } from "@wailsjs/go/models";
import { getAppConfig } from "@/app.config";
import { SystemIconComponent } from "@/common/components/icon";
import { ReqMethodTag } from "@/request/method.tag";
import {
	AppService,
	GlobalModalsService,
	TabsService,
	UserAuthService,
} from "@/services";

@Component({
	selector: `div[gurl-req-example-item]`,
	template: `
    <div class="flex flex-col gap-2 p-2">
	  <div class="flex items-center">
			<div class="flex-1 flex items-center flex-nowrap gap-2 overflow-hidden">
                <i gurl-icon [icon]="'RequestExample'" [className]="'size-4'" ></i>
				<div gurl-req-tag [size]="'xs'" [method]="data().method"></div>
				<a class="block hover:cursor-pointer focus:underline focus:outline-0 flex-1 text-sm truncate" (click)="handleOpenReqExample()">
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
                @if(appconfig.mode === "web"){
                    <li 
                        [ngClass]="{
                        'menu-disabled': !!userAuthSvc.userInfo()?.isDemoUser,
                        }"
                    >
                        <a (click)="handleMockExample()" [ariaDisabled]="!!userAuthSvc.userInfo()?.isDemoUser">
                            <i gurl-icon [icon]="'Mock'" [className]="'size-4'" ></i> 
                            Mock
                        </a>
                    </li>
                    <li>
                        <a (click)="toggleDeleteModal()">
                            <i gurl-icon [icon]="'Delete'" [className]="'size-4'" ></i> 
                            Delete
                        </a>
                    </li>
                }
                @if(appconfig.mode === "desktop"){
                     <li>
                        <a (click)="handleMockExample()">
                            <i gurl-icon [icon]="'Mock'" [className]="'size-4'" ></i> 
                            Mock
                        </a>
                    </li>
                    <li>
                        <a (click)="toggleDeleteModal()">
                            <i gurl-icon [icon]="'Delete'" [className]="'size-4'" ></i> 
                            Delete
                        </a>
                    </li>
                }
			</ul>
	  		</div>
	  </div>
       <p class="text-sm truncate opacity-50">
        {{ data().url }}
      </p>
    </div>
  `,
	imports: [ReqMethodTag, NgClass, SystemIconComponent],
})
export class GurlReqExampleItem {
	@HostBinding("class")
	def = "border-2 border-base-100 shadow-md rounded-box";

	data = input.required<models.ReqExampleLightDTO>();

	protected readonly appconfig = getAppConfig();

	private readonly tabSvc = inject(TabsService);
	protected readonly userAuthSvc = inject(UserAuthService);
	private readonly appSvc = inject(AppService);
	private readonly modalsSvc = inject(GlobalModalsService);

	protected handleOpenReqExample() {
		this.tabSvc.openReqExampleTab(this.data());
	}

	protected handleMockExample() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.appSvc.createMockFroMExample(this.data().id);
	}

	protected toggleDeleteModal() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.modalsSvc.handleOpendeleteReqExampleModal(this.data());
	}
}
