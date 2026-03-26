import { getAppConfig } from "@/app.config";
import type { Exporter } from "@/types";
import { DesktopExporter } from "./desktop/desktop.exporter";
import { WebExporter } from "./web/web.exporter";

export function getExporter(): Exporter {
	const { mode } = getAppConfig();
	switch (mode) {
		case "desktop":
			return DesktopExporter.getInstance();
		case "web":
			return WebExporter.getInstance();
		default:
			throw new Error("Unsupported mode");
	}
}
