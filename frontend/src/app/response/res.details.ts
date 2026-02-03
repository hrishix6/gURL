import { Component, HostBinding, inject } from "@angular/core";
import {
	Ban,
	ChevronDown,
	ChevronUp,
	Copy,
	EllipsisVertical,
	LucideAngularModule,
	MessageCircleWarning,
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
import { ResStats } from "./res.stats";

@Component({
	selector: "gurl-res-details",
	template: `
    <header class="flex justify-between items-center">
      <gurl-section-tabs
        [defaultActive]="formSvc.activeResTab()"
        (onActiveChange)="handleTabChange($event)"
        [tabs]="resDetailsTabs"
        [activeTab]="formSvc.activeResTab()"
      ></gurl-section-tabs>

      @if(formSvc.res()){
          <gurl-res-stats [data]="formSvc.res()!" />      
      }
    </header>
    <div class="flex-1 flex flex-col overflow-hidden relative p-2">
      @switch (formSvc.activeResTab()) { 
        @case ("res_headers") { 
        <gurl-res-headers />
      } @case ("res_body"){ 
        <gurl-res-body />
      } @case('res_console') {
      <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <!-- <div class="w-96 border-2 border-base-100 shadow-md rounded-box">
          <div class="flex flex-col gap-2 p-2">
              <div class="flex items-center">
                <div class="flex-1 flex items-center flex-nowrap gap-2 overflow-hidden">
                  <div gurl-req-tag [size]="'xs'" [method]="'GET'"></div>
                  <a href="#" class="block focus:underline focus:outline-0 flex-1 text-sm truncate">
                    example request
                  </a>
                </div>
                <button class="btn btn-sm btn-square btn-ghost" (click)="toggleOpen()">
                    @if(isOpen()) {
                          <lucide-angular [img]="CloseIcon" class="size-4" />
                        }@else {
                          <lucide-angular [img]="OpenIcon" class="size-4" />
                      }
                </button>
                <div class="dropdown dropdown-end" data-el="req-options-btn">
                  <button tabindex="0" class="btn btn-sm btn-square btn-ghost">
                  <lucide-angular [img]="RequestOptsIcon" class="size-4" />
                  </button>
                  <ul
                  tabindex="-1"
                  class="dropdown-content menu bg-base-100 rounded-box z-50 w-max shadow-sm"
                  >
                    <li class="my-0.5">
                      <a href="#">
                        <lucide-angular [img]="CopyIcon" class="size-4"  /> 
                        Copy 
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <lucide-angular [img]="DeleteIcon" class="size-4" /> 
                        Delete
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
                <p class="text-sm truncate opacity-50">
                  {{ exRequestdto.url }}
                </p>
                @if(isOpen()) {
                  <p class="text-sm mt-1">
                    Examples :
                  </p>
                  <div class="p-2  bg-base-100 rounded box flex items-center justify-between overflow-hidde">
                      <span class="text-xs truncate">
                        Request Options Placeholder long ass request example
                      </span>
                      <div class="flex items-center">
                          <button class="btn btn-sm btn-square btn-ghost">
                            <lucide-angular [img]="CopyIcon" class="size-4"  />
                          </button>
                          <button class="btn btn-sm btn-square btn-ghost">
                            <lucide-angular [img]="DeleteIcon" class="size-4"  />
                          </button>
                      </div>
                  </div>
                }
          </div>
        </div> -->
          
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
		ResStats,
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
	protected readonly CopyIcon = Copy;
	protected readonly NoneIcon = Ban;
	protected readonly AbortedIcon = ShieldBanIcon;
	protected readonly ErroredReqIcon = MessageCircleWarning;
	protected readonly formSvc = inject(FormService);
	protected readonly resDetailsTabs = RES_DETAILS_TABS;

	protected handleTabChange(id: ResTabId) {
		this.formSvc.setActiveResTab(id);
	}
}
