import { Injectable, inject } from "@angular/core";
import { type CanActivate, Router } from "@angular/router";
import { getAppConfig } from "@/app.config";
import { UserAuthService } from "@/services";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
	private router = inject(Router);
	private userAuthSvc = inject(UserAuthService);

	canActivate(): boolean {
		const appConfig = getAppConfig();

		if (appConfig.mode === "desktop") {
			return true;
		}

		if (this.userAuthSvc.isLoggedIn()) {
			return true;
		}

		this.router.navigate(["/login"]);
		return false;
	}
}
