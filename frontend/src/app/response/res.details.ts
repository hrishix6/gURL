import { Component, HostBinding, inject } from "@angular/core";
import { Tab } from "@/common/components";
import { SystemIconComponent } from "@/common/components/icon";
import { ResDetailsTabContentDirective } from "@/common/directives/res.details.content";
import { RES_DETAILS_TABS } from "@/constants";
import { FormService } from "@/services";
import type { ResTabId } from "@/types";
import { ResBody } from "./res.body";
import { ResCookies } from "./res.cookies";
import { ResFooter } from "./res.footer";
import { ResHeaders } from "./res.headers";

@Component({
	selector: "gurl-res-details",
	template: `
    <header class="flex justify-between">
      <gurl-section-tabs
        [defaultActive]="formSvc.activeResTab()"
        (onActiveChange)="handleTabChange($event)"
        [tabs]="resDetailsTabs"
        [activeTab]="formSvc.activeResTab()"
      ></gurl-section-tabs>
	  @if(formSvc.res()) {
	  <div class="join px-2 py-1">
                  @if(formSvc.tabType() === "req"){ 
					@if(formSvc.draftParentData().parentRequestId){
						<button class="btn btn-sm btn-soft join-item" (click)="formSvc.handleOpenSaveExampleModal()">
							<i gurl-icon [icon]="'Save'" [className]="'size-4'" ></i>
						</button>
					}
					<button class="btn btn-sm btn-soft join-item" (click)="formSvc.saveToFile()">
							<i gurl-icon [icon]="'Export'" [className]="'size-4'" ></i>
					</button>
					<button class="btn btn-sm btn-soft join-item" (click)="formSvc.clearResponse()">
						<i gurl-icon [icon]="'Clear'" [className]="'size-4'" ></i>
					</button>
                  }
        </div>
	}
    </header>
	
    <div class="flex-1 flex flex-col overflow-hidden relative p-2">
			<gurl-res-headers res-details-tab-content [active]="formSvc.activeResTab() === 'res_headers'"/>
			<gurl-res-body res-details-tab-content [active]="formSvc.activeResTab() === 'res_body'"/>
			<gurl-res-cookies res-details-tab-content [active]="formSvc.activeResTab() === 'res_cookies'" />
    </div>
    @if(formSvc.res()) {
          <gurl-res-footer
           [data]="formSvc.res()!"
          />
    }
  `,
	imports: [
		Tab,
		ResHeaders,
		ResCookies,
		ResFooter,
		ResBody,
		SystemIconComponent,
		ResDetailsTabContentDirective,
	],
})
export class ResponseDetails {
	@HostBinding("class")
	hostClass = "flex-1 flex flex-col overflow-hidden";
	protected readonly formSvc = inject(FormService);
	protected readonly resDetailsTabs = RES_DETAILS_TABS;

	protected handleTabChange(id: ResTabId) {
		this.formSvc.setActiveResTab(id);
	}
}
