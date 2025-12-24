import { Component, inject } from "@angular/core";
import {
	LucideAngularModule,
	PanelRightClose,
	PanelRightOpen,
} from "lucide-angular";
import { AppService } from "../../services";

/**
 * This renders the button that toggles sidebar on mobile and desktops
 */
@Component({
	selector: `div[appSidebarToggle]`,
	template: `
    <!-- this label toggles mobile sidebar -->
    <button
      class="hidden xl:block btn btn-ghost btn-square btn-sm"
      (click)="appSvc.toggleDesktopSidebar()"
    >
      <div class="tooltip">
        <div class="tooltip-content">
          @if(appSvc.isDesktopSidebarOpen()){ <span class="font-normal">Close Sidebar</span> }@else
          { <span class="font-normal">Open Sidebar</span> }
        </div>
        @if(appSvc.isDesktopSidebarOpen()){
        <lucide-angular [img]="ShrinkSidebarIcon" class="size-4" />
        }@else {
        <lucide-angular [img]="ExpandSidebarIcon" class="size-4" />
        }
      </div>
    </button>

    <button
      class="xl:hidden btn btn-ghost btn-xs btn-square drawer-button"
      (click)="appSvc.toggleMobileSidebar()"
    >
      <div class="tooltip">
        <div class="tooltip-content">
          @if(appSvc.isMobileSidebarOpen()){
          <span class="font-normal">Close Sidebar</span>
          } @else {
          <span class="font-normal">Open Sidebar</span>
          }
        </div>
        @if(appSvc.isMobileSidebarOpen()){
        <lucide-angular [img]="ShrinkSidebarIcon" class="size-4" />
        } @else {
        <lucide-angular [img]="ExpandSidebarIcon" class="size-4" />
        }
      </div>
    </button>
  `,
	imports: [LucideAngularModule],
})
export class AppSidebarToggle {
	readonly ExpandSidebarIcon = PanelRightClose;
	readonly ShrinkSidebarIcon = PanelRightOpen;
	readonly appSvc = inject(AppService);
}
