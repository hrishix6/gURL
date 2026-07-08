import { Injectable, inject } from "@angular/core";
import { type CanActivate, Router } from "@angular/router";
import { getAppConfig } from "@/app.config";
import { UserAuthService } from "@/services";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
	private router = inject(Router);
	private userAuthSvc = inject(UserAuthService);

	async canActivate() {
		const appConfig = getAppConfig();

		if (appConfig.mode === "desktop") {
			return true;
		}

		if (appConfig.setup_required) {
			this.router.navigate(["/setup"], { replaceUrl: true });
			return false;
		}

		const checkGood = await this.userAuthSvc.checkLogin();

		if (checkGood) {
			return true;
		}

		this.router.navigate(["/login"]);
		return false;
	}
}
