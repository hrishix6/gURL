import { Component, HostBinding, inject } from "@angular/core";
import { AppService } from "@/services";
import { AppSidebarHeader } from "./app.sidebar.header";
import { AppCollectionsSidebar } from "./collections/collection.sidebar";
import { AppRequestHistory } from "./history/history.sidebar";

@Component({
	selector: `aside[appDesktopSidebar]`,
	template: `
      <div appSidebarHeader></div>
      @switch (appSvc.appSidebarContent()) { @case ("history") {
      <div gurlReqHistory></div>
      } @case("collections"){
      <app-collections />
      } }
  `,
	imports: [AppCollectionsSidebar, AppSidebarHeader, AppRequestHistory],
})
export class DesktopSidebar {
	@HostBinding("class")
	def =
		"basis-96 hidden xl:flex flex-col shrink-0 grow-0 bg-base-200 overflow-hidden border-r-2 border-base-100";

	appSvc = inject(AppService);
}
