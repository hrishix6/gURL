import { Component, inject, type OnInit } from "@angular/core";
import { RouterOutlet, type Routes } from "@angular/router";
import { App } from "@/app";
import { AppService } from "@/services";
import { AuthGuard } from "./auth.guard";
import { AuthPagesGuard } from "./auth.pages.guard";
import { SetupGuard } from "./first.setup.guard";
import { LoginPage } from "./pages/login";
import { UserSettings } from "./pages/settings";
import { FirstTimeSetupPage } from "./pages/setup";

export const routes: Routes = [
	{
		path: "login",
		component: LoginPage,
		canActivate: [AuthPagesGuard],
	},
	{
		path: "settings",
		component: UserSettings,
		canActivate: [AuthGuard],
	},
	{
		path: "setup",
		component: FirstTimeSetupPage,
		canActivate: [SetupGuard],
	},
	{
		path: "",
		component: App,
		canActivate: [AuthGuard],
	},
];

@Component({
	selector: "gurl-router",
	template: `
      <router-outlet />
    `,
	imports: [RouterOutlet],
})
export class MainRouter implements OnInit {
	private readonly appSvc = inject(AppService);

	ngOnInit(): void {
		this.appSvc.initializeAppPreferences();
	}
}
