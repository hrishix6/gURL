import { NgClass } from "@angular/common";
import { Component, HostBinding, inject, input } from "@angular/core";
import { Router } from "@angular/router";
import {
	Cog,
	Container,
	History,
	Layers,
	LogOut,
	LucideAngularModule,
} from "lucide-angular";
import { getAppConfig } from "@/app.config";
import { AlertService, AppService, UserAuthService } from "@/services";
import { AppSidebarContent } from "@/types";

@Component({
	selector: `gurl-taskbar`,
	template: `
    <header class="flex flex-col gap-4 items-center">
		<div class="tooltip tooltip-right" data-tip="Collections">
				<button
				[ngClass]="{
					'btn btn-square': true,
					'btn-soft btn-primary': appSvc.appSidebarContent() === 'collections'
				}"
				(click)="handleSidebarTabSelection('c')">
				<lucide-angular [img]="CollectionIcon" class="size-5" />
			</button>
		</div>
      	 <div class="tooltip tooltip-right" data-tip="Environments">
			<button
			[ngClass]="{
				'btn btn-square': true,
				'btn-soft btn-primary': appSvc.appSidebarContent() === 'environments'
			}"
			(click)="handleSidebarTabSelection('e')">
			<lucide-angular [img]="EnvironmentIcon" class="size-5" />
		</button>
		</div>
		 <div class="tooltip tooltip-right" data-tip="History">
			<button
			[ngClass]="{
					'btn btn-square': true,
					'btn-soft btn-primary': appSvc.appSidebarContent() === 'history'
				}"
			(click)="handleSidebarTabSelection('h')"> 
			<lucide-angular [img]="HistoryIcon" class="size-5" />
		</button>
		 </div>
    </header>
    <footer class="mt-auto flex justify-center flex-col gap-4">
      @if(mode == "web"){
		<div class="tooltip tooltip-right" data-tip="Preferences">
			<button class="btn btn-square" (click)="handleOpenSettings()">
			<lucide-angular [img]="SettingsIcon" class="size-5" />
		</button>
		</div>
		<div class="tooltip tooltip-right" data-tip="Log Out">
			 <button class="btn btn-square" (click)="handleLogout()">
         			 <lucide-angular [img]="LogoutIcon" class="size-5" />
        	</button>
		</div>
      }
    </footer>
  `,
	imports: [LucideAngularModule, NgClass],
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
	protected readonly LogoutIcon = LogOut;
	protected readonly SettingsIcon = Cog;

	protected readonly CollectionIcon = Layers;
	protected readonly EnvironmentIcon = Container;
	protected readonly HistoryIcon = History;

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

	handleOpenSettings() {
		this.router.navigate(["/settings"]);
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
		}
	}
}
