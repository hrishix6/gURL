import { Injectable, inject } from "@angular/core";
import { type CanActivate, Router } from "@angular/router";
import { getAppConfig } from "@/app.config";

@Injectable({ providedIn: "root" })
export class SetupGuard implements CanActivate {
	private router = inject(Router);

	canActivate(): boolean {
		const appConfig = getAppConfig();

		if (!appConfig.setup_required) {
			this.router.navigate(["/"], { replaceUrl: true });
			return false;
		}

		return true;
	}
}
