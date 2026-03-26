import {
	type ApplicationConfig,
	provideAppInitializer,
	provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter } from "@angular/router";
import { getAppConfig, isConfigError, loadConfig } from "./app.config";
import { routes } from "./app.routes";

async function initializeApp() {
	await loadConfig();

	if (isConfigError()) {
		throw new Error("Failed to load config, bootstrap failed");
	}

	const appCfg = getAppConfig();

	if (!appCfg) {
		throw new Error("Failed to load config, bootstrap failed");
	}

	//pdfjs
	window.pdfWorkerSrc = "pdf.worker.min.mjs";
}

export const config: ApplicationConfig = {
	providers: [
		provideBrowserGlobalErrorListeners(),
		provideRouter(routes),
		provideAppInitializer(initializeApp),
	],
};
