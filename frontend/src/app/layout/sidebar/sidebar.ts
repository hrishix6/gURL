import { Component, HostBinding, inject, input, signal } from "@angular/core";
import { SystemIconComponent } from "@/common/components/icon";
import { SidebarContentDirective } from "@/common/directives/sidebar.content";
import { AppService } from "@/services";
import { GurlCollections } from "./collections/collection.sidebar";
import { GurlEnvironments } from "./environments/environments.sidebar";
import { GurlReqHistory } from "./history/history.sidebar";
import { GurlMockServers } from "./mock-servers/mock.servers.sidebar";

@Component({
	selector: `aside[gurl-sidebar]`,
	template: `
	@if(appSvc.appSidebarContent() !== 'user-settings'){
	<div class="px-2 pt-2">
      <label class="input input-ghost w-full input-primary bg-base-300">
        <i gurl-icon [icon]="'Search'" [className]="'size-4'" ></i>
        <input
          type="search"
          required
          placeholder="Search"
          [value]="searchInput()"
          (input)="handleInput($event)"
        />
      </label>
    </div>
	}
	<gurl-history sidebar-content [active]="appSvc.appSidebarContent() === 'history'"  />
	<gurl-collections  sidebar-content [active]="appSvc.appSidebarContent() === 'collections'"/>
	<gurl-environments sidebar-content [active]="appSvc.appSidebarContent() === 'environments'"/>
	<gurl-mock-servers sidebar-content [active]="appSvc.appSidebarContent() === 'mock-servers'" />
	<div sidebar-content [active]="appSvc.appSidebarContent() === 'user-settings'">
		TODO: User Settings
	</div>
  `,
	imports: [
		GurlCollections,
		GurlReqHistory,
		GurlEnvironments,
		GurlMockServers,
		SystemIconComponent,
		SidebarContentDirective,
	],
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

	protected searchInput = signal<string>("");

	protected handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		this.searchInput.set(target.value);
		this.appSvc.searchKeyChanges$.next(target.value);
	}
}
