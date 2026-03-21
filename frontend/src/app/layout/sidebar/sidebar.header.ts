import { Component } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import { GurlReqSidebarTabs } from "./sidebar.tabs";

@Component({
	selector: `gurl-sidebar-header`,
	template: `
      <div class="flex border-b-2 border-base-100 p-1">
        <gurl-req-sidebar-tabs />
      </div>
  `,
	imports: [LucideAngularModule, GurlReqSidebarTabs],
})
export class GurlSidebarHeader {}
