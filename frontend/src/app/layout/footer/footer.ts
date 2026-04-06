import { NgClass } from "@angular/common";
import { Component, HostBinding, inject } from "@angular/core";
import { LucideAngularModule, SquareTerminal } from "lucide-angular";
import { getAppConfig } from "@/app.config";
import { GurlDemoSessionProgress } from "@/common/components/demo.session.progress";
import { GurlStatusBeacon } from "@/common/components/status.beacon";
import { AppService, UserAuthService } from "@/services";
import { GurlLayoutSwitcher } from "./layout.switcher";
import { GurlSidebarToggle } from "./sidebar.toggle";
import { GurlThemeSwitcher } from "./theme.switcher";

@Component({
	selector: "footer[gurl-footer]",
	template: `
    <div class="flex flex-1 items-center gap-1">
		@if (mode === "web") {
			<gurl-status-beacon />
		  }
		 <button [ngClass]="{
			'btn btn-sm': true,
			'btn-soft btn-primary': appSvc.isConsoleOpen(),
			'bg-base-300': !appSvc.isConsoleOpen()
		 }"
		 (click)="appSvc.toggleConsole()"
		 >
          <lucide-angular [img]="ConsoleIcon" class="size-4" />
		  <span>Console</span>
        </button>
		@if (mode === "web") {
			@if(!!userAuthSvc.userInfo()?.isDemoUser) {
				<gurl-demo-session-progress />
			}
		}
		 <div class="flex items-center gap-4 ml-auto">
				<div gurl-theme-switcher></div>
		 		<div gurl-sidebar-toggle></div>
         		<div gurl-layout-switcher></div>
				
		 </div>
    </div>
  `,
	imports: [
		GurlLayoutSwitcher,
		GurlThemeSwitcher,
		LucideAngularModule,
		GurlStatusBeacon,
		GurlSidebarToggle,
		NgClass,
		GurlDemoSessionProgress,
	],
})
export class GurlFooter {
	@HostBinding("class")
	def = "py-1 px-2 bg-base-200 flex border-t-2 border-base-100";

	protected readonly ConsoleIcon = SquareTerminal;

	protected readonly mode = getAppConfig().mode;
	protected readonly appSvc = inject(AppService);
	protected readonly userAuthSvc = inject(UserAuthService);
}
