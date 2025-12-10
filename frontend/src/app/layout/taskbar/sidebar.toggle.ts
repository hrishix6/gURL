import { Component, inject } from '@angular/core';
import { LucideAngularModule, PanelRightClose, PanelRightOpen } from 'lucide-angular';
import { AppService } from '../../../services';

/**
 * This renders the button that toggles sidebar on mobile and desktops
 */
@Component({
  selector: `div[appSidebarToggle]`,
  template: `
    <button
      class="hidden xl:block btn btn-ghost btn-primary btn-sm"
      (click)="appSvc.toggleDesktopSidebar()"
    >
      @if(appSvc.isDesktopSidebarOpen()){
      <lucide-angular [img]="ShrinkSidebarIcon" class="size-5" />
      }@else {
      <lucide-angular [img]="ExpandSidebarIcon" class="size-5" />
      }
    </button>

    <!-- this label toggles mobile sidebar -->
    <label
      class="xl:hidden btn btn-ghost btn-primary btn-sm drawer-button"
      (click)="appSvc.setMobileSidebarState(true)"
    >
      @if(appSvc.isMobileSidebarOpen()){
      <lucide-angular [img]="ShrinkSidebarIcon" class="size-5" />
      }@else {
      <lucide-angular [img]="ExpandSidebarIcon" class="size-5" />
      }
    </label>
  `,
  imports: [LucideAngularModule],
})
export class AppSidebarToggle {
  readonly ExpandSidebarIcon = PanelRightClose;
  readonly ShrinkSidebarIcon = PanelRightOpen;
  readonly appSvc = inject(AppService);
}
