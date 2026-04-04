import { Component, HostBinding, inject } from "@angular/core";
import { Router } from "@angular/router";
import { Cog, LogOut, LucideAngularModule, UserCog, UserPlus, UserRoundPlus } from "lucide-angular";
import { getAppConfig } from "@/app.config";
import { AlertService, GlobalModalsService, UserAuthService } from "@/services";
import { GurlSidebarToggle } from "./sidebar.toggle";

@Component({
	selector: `gurl-taskbar`,
	template: `
    <header class="flex flex-col gap-4 items-center">
      <div gurl-sidebar-toggle></div>
    </header>
    <footer class="mt-auto flex justify-center flex-col gap-4">
      @if(mode == "web"){
		@if(userAuthSvc.userInfo()?.isAdmin){
		<button class="btn btn-square" (click)="handleOpenInviteDialogue()">
			<lucide-angular [img]="InviteIcon" class="size-5" />
		</button>
		}
		<button class="btn btn-square" (click)="handleOpenSettings()">
			<lucide-angular [img]="SettingsIcon" class="size-5" />
		</button>
        <button class="btn btn-square" (click)="handleLogout()">
          <lucide-angular [img]="LogoutIcon" class="size-5" />
        </button>
      }
    </footer>
  `,
	imports: [LucideAngularModule, GurlSidebarToggle],
})
export class Taskbar {
	@HostBinding("class")
	def =
		"basis-10 grow-0 shrink-0 bg-base-200 flex flex-col items-center p-2 relative border-r-2 border-base-100";

	protected readonly mode = getAppConfig().mode;
	protected readonly LogoutIcon = LogOut;
	protected readonly SettingsIcon = Cog;
	protected readonly InviteIcon = UserRoundPlus;

	private readonly router = inject(Router);
	protected readonly userAuthSvc = inject(UserAuthService);
	private readonly alertSvc = inject(AlertService);
	private readonly modalsSvc = inject(GlobalModalsService);

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

	handleOpenInviteDialogue() {
		this.modalsSvc.openInviteUserModal();
	}
}
