import { NgClass } from "@angular/common";
import { Component, HostBinding, inject, input } from "@angular/core";
import { Router } from "@angular/router";
import { getAppConfig } from "@/app.config";
import { SystemIconComponent } from "@/common/components/icon";
import { TooltipDirective } from "@/common/components/tooltip";
import { AlertService, AppService, UserAuthService } from "@/services";
import { AppSidebarContent } from "@/types";

@Component({
	selector: `gurl-taskbar`,
	template: `
    <header class="flex flex-col gap-4 items-center">
		<button
		     gurlTooltip [tooltip]="'Collections'" [position]="'right'"
				[ngClass]="{
					'btn btn-square': true,
					'btn-soft btn-primary': appSvc.appSidebarContent() === 'collections'
				}"
				(click)="handleSidebarTabSelection('c')">
				<i gurl-icon [icon]="'Collection'" [className]="'size-5'" ></i>
		</button>
		<button
		    gurlTooltip [tooltip]="'Environments'" [position]="'right'"
			[ngClass]="{
				'btn btn-square': true,
				'btn-soft btn-primary': appSvc.appSidebarContent() === 'environments'
			}"
			(click)="handleSidebarTabSelection('e')">
			<i gurl-icon [icon]="'Environment'" [className]="'size-5'" ></i>
		</button>
		 <button
		         gurlTooltip [tooltip]="'History'" [position]="'right'"
				[ngClass]="{
						'btn btn-square': true,
						'btn-soft btn-primary': appSvc.appSidebarContent() === 'history'
					}"
				(click)="handleSidebarTabSelection('h')"> 
				<i gurl-icon [icon]="'History'" [className]="'size-5'" ></i>
		</button>
		 @if(!(mode == "web" && userAuthSvc.userInfo()?.isDemoUser)){
			<button
				 gurlTooltip [tooltip]="'Mock Servers'" [position]="'right'"
					[ngClass]="{
							'btn btn-square': true,
							'btn-soft btn-primary': appSvc.appSidebarContent() === 'mock-servers'
						}"
					(click)="handleSidebarTabSelection('m')"> 
					<i gurl-icon [icon]="'MockServer'" [className]="'size-5'" ></i>
			</button>
		 }
    </header>
    <footer class="mt-auto flex justify-center flex-col gap-4">
		<button [ngClass]="{
				'btn btn-square': true,
				'btn-soft btn-primary': appSvc.appSidebarContent() === 'user-settings'
			}" 
			(click)="handleSidebarTabSelection('u')" gurlTooltip [tooltip]="'Settings'" [position]="'right'">
			<i gurl-icon [icon]="'Settings'" [className]="'size-5'" ></i>
		</button>
      @if(mode == "web"){
		<button class="btn btn-square" (click)="handleLogout()" gurlTooltip [tooltip]="'Log Out'" [position]="'right'">
         			 <i gurl-icon [icon]="'Logout'" [className]="'size-5'" ></i>
        </button>
      }
    </footer>
  `,
	imports: [NgClass, SystemIconComponent, TooltipDirective],
})
export class Taskbar {
	@HostBinding("class") get def() {
		switch (this.variant()) {
			case "desktop":
				return "hidden xl:flex basis-10 grow-0 shrink-0 bg-base-200 xl:flex-col xl:items-center p-2 relative border-r-2 border-base-100";

			case "mobile":
				return "xl:hidden min-h-full basis-10 grow-0 shrink-0 bg-base-200 flex flex-col items-center p-2 relative border-r-2 border-base-100";

			default:
				return "";
		}
	}

	variant = input.required<"mobile" | "desktop">();

	protected readonly mode = getAppConfig().mode;

	private readonly router = inject(Router);
	protected readonly userAuthSvc = inject(UserAuthService);
	private readonly alertSvc = inject(AlertService);
	protected readonly appSvc = inject(AppService);

	async handleLogout() {
		const success = await this.userAuthSvc.logout();
		if (!success) {
			this.alertSvc.addAlert("failed to logout, try again later", "error");
			return;
		}

		this.router.navigate(["/login"], { replaceUrl: true });
	}

	protected handleSidebarTabSelection(content: string) {
		switch (content) {
			case "c":
				this.appSvc.setCurrentSidebarContent(AppSidebarContent.Collections);
				break;
			case "e":
				this.appSvc.setCurrentSidebarContent(AppSidebarContent.Environments);
				break;
			case "h":
				this.appSvc.setCurrentSidebarContent(AppSidebarContent.History);
				break;
			case "m":
				this.appSvc.setCurrentSidebarContent(AppSidebarContent.MockServers);
				break;
			case "u":
				this.appSvc.setCurrentSidebarContent(AppSidebarContent.UserSettings);
				break;
		}
	}
}
