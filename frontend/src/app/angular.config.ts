import {
	type ApplicationConfig,
	provideAppInitializer,
	provideBrowserGlobalErrorListeners,
} from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { routes } from "../main.router";
import { getAppConfig, isConfigError, loadConfig } from "./app.config";

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
		provideRouter(routes, withComponentInputBinding()),
		provideAppInitializer(initializeApp),
	],
};
