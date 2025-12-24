import { NgClass } from "@angular/common";
import { Component, inject } from "@angular/core";
import { History, LucideAngularModule } from "lucide-angular";
import { AppService } from "../../services";
import { AppSidebarContent } from "../../../types";

/**
 * This renders the button that toggles sidebar on mobile and desktops
 */
@Component({
	selector: `div[appHistoryToggle]`,
	template: `
    <button
      [ngClass]="{
        'hidden xl:block btn btn-primary btn-sm': true,
        'btn-ghost': appSvc.appSidebarContent() !== 'history',
        'btn-primary': appSvc.appSidebarContent() === 'history'
      }"
      (click)="setSidebarContent()"
    >
      <lucide-angular [img]="HistoryIcon" class="size-5" />
    </button>

    <!-- this label toggles mobile sidebar -->
    <label
      [ngClass]="{
        'xl:hidden btn btn-xs drawer-button': true,
        'btn-ghost': appSvc.appSidebarContent() !== 'history',
        'btn-primary': appSvc.appSidebarContent() === 'history'
      }"
      (click)="mobileSidebarContent()"
    >
      <lucide-angular [img]="HistoryIcon" class="size-4" />
    </label>
  `,
	imports: [LucideAngularModule, NgClass],
})
export class AppHistoryToggle {
	readonly HistoryIcon = History;

	setSidebarContent() {
		this.appSvc.setCurrentSidebarContent(AppSidebarContent.History);
		const isOpen = this.appSvc.isDesktopSidebarOpen();
		if (!isOpen) {
			this.appSvc.toggleDesktopSidebar();
		}
	}

	mobileSidebarContent() {
		this.appSvc.setCurrentSidebarContent(AppSidebarContent.History);
		const isOpen = this.appSvc.isMobileSidebarOpen();
		if (!isOpen) {
			this.appSvc.toggleMobileSidebar();
		}
	}

	appSvc = inject(AppService);
}
