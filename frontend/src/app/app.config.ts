import { CONFIG_FILE_PATH } from "./constants";
import type { AppConfig } from "./types";

let config_error = false;

let appConfig: AppConfig | null = null;

export async function loadConfig() {
	try {
		const res = await fetch(CONFIG_FILE_PATH);
		if (!res.ok) {
			config_error = true;
			return;
		}
		appConfig = await res.json();
	} catch (error) {
		console.log(error);
		config_error = true;
	}
}

export function isConfigError() {
	return config_error;
}

export function getAppConfig() {
	if (appConfig == null) {
		throw new Error("Invalid app config");
	}

	return appConfig;
}
