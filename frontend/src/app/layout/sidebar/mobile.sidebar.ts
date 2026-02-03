import { Component, HostBinding, inject } from "@angular/core";
import { AppService } from "@/services";
import { GurlCollections } from "./collections/collection.sidebar";
import { GurlEnvironments } from "./environments/environments.sidebar";
import { GurlReqHistory } from "./history/history.sidebar";
import { GurlSidebarHeader } from "./sidebar.header";

@Component({
	selector: "aside[gurl-mobile-sidebar]",
	template: `<div class="flex-1 flex flex-col overflow-hidden">
    <gurl-sidebar-header />
    @switch (appSvc.appSidebarContent()) { @case ("history") {
    <gurl-history />
    } @case("collections"){
    <gurl-collections />
    }
    @case("environments"){
       <gurl-environments />
       }
   }
  </div>`,
	imports: [
		GurlSidebarHeader,
		GurlCollections,
		GurlEnvironments,
		GurlReqHistory,
	],
})
export class MobileSidebar {
	@HostBinding("class")
	def = "bg-base-200 min-h-full w-[450px] flex flex-col";

	appSvc = inject(AppService);
}
