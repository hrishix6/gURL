import { Component, HostBinding, inject } from "@angular/core";
import { Tab } from "@/common/components";
import { ReqDetailsTabContentDirective } from "@/common/directives/req.details.content";
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
    <div class="flex-1 p-2 flex flex-col gap-2 overflow-hidden">
       <gurl-req-headers req-details-tab-content [active]="formSvc.activeReqTab() === 'req_headers'" />
       <gurl-req-path  req-details-tab-content [active]="formSvc.activeReqTab() === 'req_path'" />
       <gurl-req-query req-details-tab-content [active]="formSvc.activeReqTab() === 'req_query'" />
       <gurl-req-body req-details-tab-content [active]="formSvc.activeReqTab() === 'req_body'" />
       <gurl-req-auth req-details-tab-content [active]="formSvc.activeReqTab() === 'req_auth'" />
       <gurl-req-cookies req-details-tab-content [active]="formSvc.activeReqTab() === 'req_cookies'" />
    </div>
    <gurl-req-footer />
  `,
	imports: [
		Tab,
		ReqBody,
		ReqHeaders,
		ReqQuery,
		ReqCookies,
		ReqFooter,
		RequestAuth,
		ReqPath,
		ReqDetailsTabContentDirective,
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
