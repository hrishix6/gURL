import { NgClass } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Container, LucideAngularModule } from "lucide-angular";
import { AppService } from "@/services";
import { AppSidebarContent } from "@/types";

/**
 * This renders the button that toggles sidebar on mobile and desktops
 */
@Component({
	selector: `div[appEnvironmentToggle]`,
	template: `
    <button
      [ngClass]="{
        'hidden xl:inline-flex btn btn-sm': true,
        'btn-ghost': appSvc.appSidebarContent() !== 'environments',
        'btn-primary': appSvc.appSidebarContent() === 'environments'
      }"
      (click)="setSidebarContent()"
    >
      <lucide-angular [img]="EnvironmentsIcon" class="size-5" />
    </button>

    <!-- this label toggles mobile sidebar -->
    <label
      [ngClass]="{
        'xl:hidden btn btn-sm drawer-button': true,
        'btn-ghost': appSvc.appSidebarContent() !== 'environments',
        'btn-primary': appSvc.appSidebarContent() === 'environments'
      }"
      (click)="mobileSidebarContent()"
    >
      <lucide-angular [img]="EnvironmentsIcon" class="size-5" />
    </label>
  `,
	imports: [LucideAngularModule, NgClass],
})
export class EnvironmentToggle {
	readonly EnvironmentsIcon = Container;

	setSidebarContent() {
		this.appSvc.setCurrentSidebarContent(AppSidebarContent.Environments);
		const isOpen = this.appSvc.isDesktopSidebarOpen();
		if (!isOpen) {
			this.appSvc.toggleDesktopSidebar();
		}
	}

	mobileSidebarContent() {
		this.appSvc.setCurrentSidebarContent(AppSidebarContent.Environments);
		const isOpen = this.appSvc.isMobileSidebarOpen();
		if (!isOpen) {
			this.appSvc.toggleMobileSidebar();
		}
	}

	appSvc = inject(AppService);
}
