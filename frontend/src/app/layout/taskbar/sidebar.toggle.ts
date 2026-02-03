import { Component, HostBinding, inject } from "@angular/core";
import {
	LucideAngularModule,
	PanelRightClose,
	PanelRightOpen,
} from "lucide-angular";
import { AppService } from "@/services";

/**
 * This renders the button that toggles sidebar on mobile and desktops
 */
@Component({
	selector: `div[gurl-sidebar-toggle]`,
	template: `
    <!-- this label toggles mobile sidebar -->
    <button
      class="hidden xl:inline-flex btn btn-ghost btn-square btn-sm"
      (click)="appSvc.toggleDesktopSidebar()"
    >
        @if(appSvc.isDesktopSidebarOpen()){
        <lucide-angular [img]="ShrinkSidebarIcon" class="size-5" />
        }@else {
        <lucide-angular [img]="ExpandSidebarIcon" class="size-5" />
        }
    </button>

    <button
      class="xl:hidden btn btn-ghost btn-xs btn-square drawer-button"
      (click)="appSvc.toggleMobileSidebar()"
    >
        @if(appSvc.isMobileSidebarOpen()){
        <lucide-angular [img]="ShrinkSidebarIcon" class="size-5" />
        } @else {
        <lucide-angular [img]="ExpandSidebarIcon" class="size-5" />
        }
    </button>
  `,
	imports: [LucideAngularModule],
})
export class GurlSidebarToggle {
	@HostBinding("class")
	def = "flex items-center justify-center";

	protected readonly ExpandSidebarIcon = PanelRightClose;
	protected readonly ShrinkSidebarIcon = PanelRightOpen;
	protected readonly appSvc = inject(AppService);
}
