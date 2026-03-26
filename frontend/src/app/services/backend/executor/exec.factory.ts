import { getAppConfig } from "@/app.config";
import type { HttpExecutor } from "@/types";
import { DesktopHttpExecutor } from "./desktop/desktop.exec";
import { WebHttpExecutor } from "./web/web.exec";

export function getHttpExecutor(): HttpExecutor {
	const { mode } = getAppConfig();
	switch (mode) {
		case "desktop":
			return DesktopHttpExecutor.getInstance();
		case "web":
			return WebHttpExecutor.getInstance();
		default:
			throw new Error("Unsupported mode");
	}
}
