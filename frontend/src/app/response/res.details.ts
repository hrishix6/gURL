import { Component, HostBinding, inject } from "@angular/core";
import {
	Ban,
	ChevronDown,
	ChevronUp,
	EllipsisVertical,
	Eraser,
	LucideAngularModule,
	MessageCircleWarning,
	Save,
	ShieldBanIcon,
	Trash2,
} from "lucide-angular";
import { Tab } from "@/common/components";
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
							<lucide-angular [img]="SaveIcon" class="size-4" />
							Save
						</button>
					}
					<button class="btn btn-sm btn-soft join-item" (click)="formSvc.clearResponse()">
						<lucide-angular [img]="ClearIcon"  class="size-4"/>
						Clear
					</button>
                  }
        </div>
	}
    </header>
	
    <div class="flex-1 flex flex-col overflow-hidden relative p-2 mt-2">
      @switch (formSvc.activeResTab()) { 
        @case ("res_headers") { 
        <gurl-res-headers />
      } @case ("res_body"){ 
        <gurl-res-body />
      } @case('res_console') {
      <div class="flex flex-1 flex-col items-center justify-center opacity-25">
            Coming Soon
      </div>
      } 
      @case("res_cookies"){
        <gurl-res-cookies />
      }
    }
    </div>
    @if(formSvc.res()) {
          <gurl-res-footer
           [data]="formSvc.res()!"
          />
    }
  `,
	imports: [
		Tab,
		LucideAngularModule,
		ResHeaders,
		ResCookies,
		ResFooter,
		ResBody,
	],
})
export class ResponseDetails {
	@HostBinding("class")
	hostClass = "flex-1 flex flex-col overflow-hidden";

	protected readonly OpenIcon = ChevronDown;
	protected readonly CloseIcon = ChevronUp;
	protected readonly RequestOptsIcon = EllipsisVertical;
	protected readonly DeleteIcon = Trash2;
	protected readonly ClearIcon = Eraser;
	protected readonly SaveIcon = Save;
	protected readonly NoneIcon = Ban;
	protected readonly AbortedIcon = ShieldBanIcon;
	protected readonly ErroredReqIcon = MessageCircleWarning;
	protected readonly formSvc = inject(FormService);
	protected readonly resDetailsTabs = RES_DETAILS_TABS;

	getPlaceHolderForEditor() {
		return JSON.stringify({
			name: "hrishi",
			age: 10,
		});
	}

	protected handleTabChange(id: ResTabId) {
		this.formSvc.setActiveResTab(id);
	}
}
