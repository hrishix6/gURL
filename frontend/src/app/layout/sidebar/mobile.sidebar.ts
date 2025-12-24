import { Component, HostBinding, inject } from "@angular/core";
import { AppService } from "../../services";
import { AppSidebarHeader } from "./app.sidebar.header";
import { AppCollectionsSidebar } from "./collections/collection.sidebar";
import { AppRequestHistory } from "./history/history.sidebar";

@Component({
	selector: "aside[appMobileSidebar]",
	template: ` <div class="flex-1 flex flex-col gap-2">
    <div appSidebarHeader></div>
    @switch (appSvc.appSidebarContent()) { @case ("history") {
    <div gurlReqHistory></div>
    } @case("collections"){
    <app-collections />
    } }
  </div>`,
	imports: [AppCollectionsSidebar, AppSidebarHeader, AppRequestHistory],
})
export class MobileSidebar {
	@HostBinding("class")
	def = "bg-base-200 min-h-full w-80 flex flex-col";

	appSvc = inject(AppService);
}
