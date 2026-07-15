import { Component, HostBinding, inject } from "@angular/core";
import { SystemIconComponent } from "@/common/components/icon";
import { TooltipDirective } from "@/common/components/tooltip";
import { AppService } from "@/services";

/**
 * This renders the button that toggles sidebar on mobile and desktops
 */
@Component({
	selector: `div[gurl-sidebar-toggle]`,
	template: `
    <!-- this label toggles mobile sidebar -->
    <button
      class="hidden xl:inline-flex btn btn-square btn-sm"
      (click)="appSvc.toggleDesktopSidebar()"
      gurlTooltip
      [tooltip]="appSvc.isDesktopSidebarOpen()? 'Close sidebar':'Open sidebar'"
    >
        @if(appSvc.isDesktopSidebarOpen()){
          <i gurl-icon [icon]="'OpenSidebar'" [className]="'size-5'" ></i>
        }@else {
          <i gurl-icon [icon]="'CloseSidebar'" [className]="'size-5'" ></i>
        }
    </button>

    <button
      class="xl:hidden btn btn-square btn-sm drawer-button"
      (click)="appSvc.toggleMobileSidebar()"
      gurlTooltip
      [tooltip]="appSvc.isMobileSidebarOpen()? 'Close sidebar':'Open sidebar'"
    >
        @if(appSvc.isMobileSidebarOpen()){
          <i gurl-icon [icon]="'OpenSidebar'" [className]="'size-5'" ></i>
        } @else {
        
        <i gurl-icon [icon]="'CloseSidebar'" [className]="'size-5'" ></i>
        }
    </button>
  `,
	imports: [SystemIconComponent, TooltipDirective],
})
export class GurlSidebarToggle {
	@HostBinding("class")
	def = "flex items-center justify-center";

	protected readonly appSvc = inject(AppService);
}
