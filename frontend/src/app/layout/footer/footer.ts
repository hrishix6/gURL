import { NgClass } from "@angular/common";
import { Component, HostBinding, inject } from "@angular/core";
import { getAppConfig } from "@/app.config";
import { GurlDemoSessionProgress } from "@/common/components/demo.session.progress";
import { SystemIconComponent } from "@/common/components/icon";
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
			'btn-primary': appSvc.isConsoleOpen(),
			'bg-base-300': !appSvc.isConsoleOpen()
		 }"
		 (click)="appSvc.toggleConsole()"
		 >
           <i gurl-icon [icon]="'Console'" [className]="'size-4'" ></i>
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
		GurlStatusBeacon,
		GurlSidebarToggle,
		NgClass,
		GurlDemoSessionProgress,
		SystemIconComponent,
	],
})
export class GurlFooter {
	@HostBinding("class")
	def = "py-1 px-2 bg-base-200 flex border-t-2 border-base-100";

	protected readonly mode = getAppConfig().mode;
	protected readonly appSvc = inject(AppService);
	protected readonly userAuthSvc = inject(UserAuthService);
}
