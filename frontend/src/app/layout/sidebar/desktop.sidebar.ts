import { Component, HostBinding, inject } from "@angular/core";
import { AppService } from "@/services";
import { GurlCollections } from "./collections/collection.sidebar";
import { GurlEnvironments } from "./environments/environments.sidebar";
import { GurlReqHistory } from "./history/history.sidebar";
import { GurlSidebarHeader } from "./sidebar.header";

@Component({
	selector: `aside[gurl-desktop-sidebar]`,
	template: `
      <gurl-sidebar-header></gurl-sidebar-header>
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
	imports: [
		GurlCollections,
		GurlSidebarHeader,
		GurlReqHistory,
		GurlEnvironments,
	],
})
export class DesktopSidebar {
	@HostBinding("class")
	def =
		"basis-[450px] hidden xl:flex flex-col shrink-0 grow-0 bg-base-200 overflow-hidden border-r-2 border-base-100";

	protected readonly appSvc = inject(AppService);
}
