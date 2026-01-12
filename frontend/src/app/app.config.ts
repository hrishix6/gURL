import {
	type ApplicationConfig,
	inject,
	provideAppInitializer,
	provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";
import { AppService } from "@/services";

async function initializeApp() {
	const appSvc = inject(AppService);
	appSvc.initializeAppPreferences();
}

export const appConfig: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideRouter(routes),
		provideAppInitializer(initializeApp),
	],
};
