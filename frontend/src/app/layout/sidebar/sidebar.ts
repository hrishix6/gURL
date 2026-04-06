import { Component, HostBinding, inject, input } from "@angular/core";
import { AppService } from "@/services";
import { GurlCollections } from "./collections/collection.sidebar";
import { GurlEnvironments } from "./environments/environments.sidebar";
import { GurlReqHistory } from "./history/history.sidebar";

@Component({
	selector: `aside[gurl-sidebar]`,
	template: `
      @switch (appSvc.appSidebarContent()) { 
		@case ("history") {
      		<gurl-history />
     	} 
	  	@case("collections"){
      		<gurl-collections />
      	} 
       @case("environments"){
       		<gurl-environments />
        }
    }
  `,
	imports: [GurlCollections, GurlReqHistory, GurlEnvironments],
})
export class Sidebar {
	mode = input.required<"mobile" | "desktop">();

	@HostBinding("class") get def() {
		switch (this.mode()) {
			case "desktop":
				return "bg-base-200 basis-[375px] hidden xl:flex flex-col shrink-0 grow-0  overflow-hidden border-r-2 border-base-100";

			case "mobile":
				return "bg-base-200 flex flex-col basis-[375px] min-h-full shrink-0 grow-0 border-r-2 border-base-100  overflow-hidden";
		}

		return "";
	}

	protected readonly appSvc = inject(AppService);
}
