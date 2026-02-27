import { Component, HostBinding, inject } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import { Tab } from "@/common/components";
import { REQ_DETAILS_TABS } from "@/constants";
import { FormService } from "@/services";
import type { ReqTabId } from "@/types";
import { RequestAuth } from "./req.auth";
import { ReqBody } from "./req.body";
import { ReqCookies } from "./req.cookies";
import { ReqFooter } from "./req.footer";
import { ReqHeaders } from "./req.headers";
import { ReqPath } from "./req.path";
import { ReqQuery } from "./req.query";

@Component({
	selector: "gurl-req-form-details",
	template: `
    <header class="flex justify-between items-center">
      <gurl-section-tabs
        [defaultActive]="formSvc.activeReqTab()"
        (onActiveChange)="handleTabChange($event)"
        [tabs]="reqDetailsTabs"
        [activeTab]="formSvc.activeReqTab()"
      ></gurl-section-tabs>
    </header>
    <div class="flex-1 p-2 flex flex-col gap-2 overflow-hidden mt-2">
      @switch (formSvc.activeReqTab()) { @case ("req_headers") {
      <gurl-req-headers />
      } @case ("req_query") {
      <gurl-req-query />
      } @case ("req_body") {
      <gurl-req-body />
      } 
      @case ("req_path") {
        <gurl-req-path />
      }
      @case ("req_auth") {
      <gurl-req-auth />
      }
      @case("req_cookies"){
      <gurl-req-cookies />
      }
    }
    </div>
    <gurl-req-footer />
  `,
	imports: [
		Tab,
		ReqBody,
		ReqHeaders,
		ReqQuery,
		LucideAngularModule,
		ReqCookies,
		ReqFooter,
		RequestAuth,
		ReqPath,
	],
})
export class RequestFormDetails {
	@HostBinding("class")
	hostClass = "flex-1 flex flex-col overflow-hidden";

	protected readonly formSvc = inject(FormService);
	protected readonly reqDetailsTabs = REQ_DETAILS_TABS;

	protected handleTabChange(id: ReqTabId) {
		this.formSvc.setActiveReqTab(id);
	}
}
