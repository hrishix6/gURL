import { Component, computed, inject, type OnInit } from "@angular/core";
import { Router, RouterOutlet, type Routes } from "@angular/router";
import { GlobalSpinner } from "@/app.spinner";
import { AppService } from "@/services";
import { ErrorPage } from "./pages/error";
import { AuthGuard } from "./pages/guards/auth.guard";
import { AuthPagesGuard } from "./pages/guards/auth.pages.guard";
import { SetupGuard } from "./pages/guards/first.setup.guard";
import { LoginPage } from "./pages/login";
import { appDataResolver } from "./pages/resolvers";
import { FirstTimeSetupPage } from "./pages/setup";

export const routes: Routes = [
	{
		path: "login",
		component: LoginPage,
		canActivate: [AuthPagesGuard],
	},
	{
		path: "setup",
		component: FirstTimeSetupPage,
		canActivate: [SetupGuard],
	},
	{
		path: "",
		canActivate: [AuthGuard],
		resolve: {
			uiState: appDataResolver,
		},
		loadComponent: () => import("./pages/app"),
		loadChildren: () => import("./pages/app.routes"),
	},
	{
		path: "**",
		pathMatch: "full",
		component: ErrorPage,
	},
];

@Component({
	selector: "gurl-router",
	template: `
	  @if(isLoadingData()){
          <gurl-spinner />
      }
	  <router-outlet />
    `,
	imports: [RouterOutlet, GlobalSpinner],
})
export class MainRouter implements OnInit {
	private readonly appSvc = inject(AppService);
	private router = inject(Router);
	isLoadingData = computed(() => !!this.router.currentNavigation());

	ngOnInit(): void {
		this.appSvc.initializeAppPreferences();
	}
}
