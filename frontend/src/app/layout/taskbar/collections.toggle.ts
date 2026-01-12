import { NgClass } from "@angular/common";
import { Component, inject } from "@angular/core";
import { Layers, LucideAngularModule } from "lucide-angular";
import { AppService } from "@/services";
import { AppSidebarContent } from "@/types";

/**
 * This renders the button that toggles sidebar on mobile and desktops
 */
@Component({
	selector: `div[appCollectionsToggle]`,
	template: `
    <button
      [ngClass]="{
        'hidden xl:inline-flex btn btn-sm': true,
        'btn-ghost': appSvc.appSidebarContent() !== 'collections',
        'btn-primary': appSvc.appSidebarContent() === 'collections'
      }"
      (click)="setSidebarContent()"
    >
      <lucide-angular [img]="CollectionsIcon" class="size-5" />
    </button>

    <!-- this label toggles mobile sidebar -->
    <label
      [ngClass]="{
        'xl:hidden btn btn-sm drawer-button': true,
        'btn-ghost': appSvc.appSidebarContent() !== 'collections',
        'btn-primary': appSvc.appSidebarContent() === 'collections'
      }"
      (click)="mobileSidebarContent()"
    >
      <lucide-angular [img]="CollectionsIcon" class="size-5" />
    </label>
  `,
	imports: [LucideAngularModule, NgClass],
})
export class AppCollectionsToggle {
	readonly CollectionsIcon = Layers;

	setSidebarContent() {
		this.appSvc.setCurrentSidebarContent(AppSidebarContent.Collections);
		const isOpen = this.appSvc.isDesktopSidebarOpen();
		if (!isOpen) {
			this.appSvc.toggleDesktopSidebar();
		}
	}

	mobileSidebarContent() {
		this.appSvc.setCurrentSidebarContent(AppSidebarContent.Collections);
		const isOpen = this.appSvc.isMobileSidebarOpen();
		if (!isOpen) {
			this.appSvc.toggleMobileSidebar();
		}
	}

	appSvc = inject(AppService);
}
