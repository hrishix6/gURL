import { Component, HostBinding, inject } from "@angular/core";
import { Router } from "@angular/router";
import { LogOut, LucideAngularModule } from "lucide-angular";
import { getAppConfig } from "@/app.config";
import { AlertService, UserAuthService } from "@/services";
import { GurlSidebarToggle } from "./sidebar.toggle";

@Component({
	selector: `gurl-taskbar`,
	template: `
    <header class="flex flex-col gap-4 items-center">
      <div gurl-sidebar-toggle></div>
    </header>
    <footer class="mt-auto flex justify-center flex-col gap-4">
      @if(mode == "web"){
        <button class="btn btn-sm btn-ghost" (click)="handleLogout()">
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
		"basis-16 grow-0 shrink-0 bg-base-200 flex flex-col items-center p-2 relative border-r-2 border-base-100";

	protected readonly mode = getAppConfig().mode;
	protected readonly LogoutIcon = LogOut;

	private readonly router = inject(Router);
	private readonly userAuthSvc = inject(UserAuthService);
	private readonly alertSvc = inject(AlertService);

	async handleLogout() {
		const success = await this.userAuthSvc.logout();
		if (!success) {
			this.alertSvc.addAlert("failed to logout, try again later", "error");
			return;
		}

		this.router.navigate(["/login"], { replaceUrl: true });
	}
}
