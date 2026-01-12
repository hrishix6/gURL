import { Component, HostBinding, inject } from "@angular/core";
import {
	Ban,
	LucideAngularModule,
	MessageCircleWarning,
	ShieldBanIcon,
} from "lucide-angular";
import { Tab } from "@/common/components";
import { RES_DETAILS_TABS } from "@/constants";
import { FormService } from "@/services";
import type { ResTabId } from "@/types";
import { ResCookies } from "./res.cookies";
import { ResFooter } from "./res.footer";
import { ResHeaders } from "./res.headers";
import { ResPreview } from "./res.preview";
import { ResStats } from "./res.stats";

@Component({
	selector: "app-res-details",
	template: `
    <header class="flex justify-between items-center">
      <app-section-tab
        [defaultActive]="formSvc.activeResTab()"
        (onActiveChange)="handleTabChange($event)"
        [tabs]="resDetailsTabs"
        [activeTab]="formSvc.activeResTab()"
      ></app-section-tab>

      @if(formSvc.res()){
          <app-res-stats [data]="formSvc.res()!"></app-res-stats>         
      }
    </header>
    <div class="flex-1 flex flex-col overflow-hidden relative p-2">
      @switch (formSvc.activeResTab()) { 
        @case ("res_headers") { 
        <div resHeaders></div>
      } @case ("res_body"){ @switch (formSvc.reqState()) { @case ("idle") {
      <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-30">
        <lucide-angular [img]="NoneIcon" class="size-16 -z-10" />
      </div>
      } @case ("aborted") {
      <div
        class="absolute top-0 left-0 w-full h-full flex items-center text-error justify-center opacity-30"
      >
        <div class="flex flex-col items-center gap-2">
          <lucide-angular [img]="AbortedIcon" class="size-16 -z-10" />
          <span class="text-lg">Request Aborted</span>
        </div>
      </div>
      } @case ("error") {
      <div
        class="absolute top-0 left-0 w-full h-full flex items-center text-error justify-center opacity-30"
      >
        <div class="flex flex-col gap-2">
          <lucide-angular [img]="ErroredReqIcon" class="size-16 -z-10" />
        </div>
      </div>
      } @case ("success") { 
        <div resPreview></div>
    } @case ("progress") {
      <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <div class="flex flex-col gap-2 items-center">
          <span class="loading loading-ring text-primary loading-sm xl:loading-lg"></span>
          <button class="btn btn-soft btn-primary btn-lg" (click)="formSvc.cancel()">Abort</button>
        </div>
      </div>
      } } } @case('res_console') {
      <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-30">
        <span>Coming Soon</span>
      </div>
      } 
      @case("res_cookies"){
        <div resCookies></div>
      }
    }
    </div>
    @if(formSvc.res()) {
          <div resFooter
           [data]="formSvc.res()!"
          ></div>
    }
  `,
	imports: [
		Tab,
		LucideAngularModule,
		ResStats,
		ResHeaders,
		ResPreview,
		ResCookies,
		ResFooter,
	],
})
export class ResponseDetails {
	readonly NoneIcon = Ban;
	readonly AbortedIcon = ShieldBanIcon;
	readonly ErroredReqIcon = MessageCircleWarning;

	readonly formSvc = inject(FormService);
	readonly resDetailsTabs = RES_DETAILS_TABS;

	@HostBinding("class")
	hostClass = "flex-1 flex flex-col overflow-hidden";

	handleTabChange(id: ResTabId) {
		this.formSvc.setActiveResTab(id);
	}
}
