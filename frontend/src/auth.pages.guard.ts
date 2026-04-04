import { Injectable, inject } from "@angular/core";
import { type CanActivate, Router } from "@angular/router";
import { getAppConfig } from "@/app.config";
import { UserAuthService } from "@/services";

@Injectable({ providedIn: "root" })
export class AuthPagesGuard implements CanActivate {
	private router = inject(Router);
	private userAuthSvc = inject(UserAuthService);

	async canActivate() {
		const appConfig = getAppConfig();

		if (appConfig.setup_required) {
			this.router.navigate(["/setup"], { replaceUrl: true });
			return false;
		}

		const checkGood = await this.userAuthSvc.checkLogin();

		if (checkGood) {
			this.router.navigate(["/"], { replaceUrl: true });
			return false;
		}

		return true;
	}
}
