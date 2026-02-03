import { Component, inject, signal } from "@angular/core";
import { Ellipsis, LucideAngularModule } from "lucide-angular";
import { AppService } from "@/services";
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
export class GurlSidebarHeader {
	private readonly appSvc = inject(AppService);

	protected readonly WorkspaceOptsIcon = Ellipsis;
	protected isOpen = signal<boolean>(false);

	protected handleDropwnToggle() {
		this.isOpen.update((prev) => !prev);
	}

	protected handleActiveItemSelection(id: string) {
		this.appSvc.setActiveWorkspace(id);
		this.handleDropwnToggle();
	}
}
