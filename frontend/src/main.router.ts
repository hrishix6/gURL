import { Component, inject, type OnInit } from "@angular/core";
import { RouterOutlet, type Routes } from "@angular/router";
import { App } from "@/app";
import { AppService } from "@/services";
import { AuthGuard } from "./auth.guard";
import { LoginPage } from "./pages/login";
import { RegisterPage } from "./pages/register";

export const routes: Routes = [
	{
		path: "login",
		component: LoginPage,
	},
	{
		path: "register",
		component: RegisterPage,
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
