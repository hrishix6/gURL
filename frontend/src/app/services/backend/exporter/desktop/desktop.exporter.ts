import {
	ExportCollection,
	ExportEnvironment,
	ImportCollection,
	ImportEnvironment,
} from "@wailsjs/go/exporter/DesktopExporter";
import type { Exporter } from "@/types";

export class DesktopExporter implements Exporter {
	private static deskopExporter: DesktopExporter | null = null;

	private constructor() {}

	static getInstance() {
		if (!DesktopExporter.deskopExporter) {
			DesktopExporter.deskopExporter = new DesktopExporter();
		}

		return DesktopExporter.deskopExporter;
	}

	exportCollection(id: string): Promise<void> {
		return ExportCollection(id);
	}
	exportEnvironment(id: string): Promise<void> {
		return ExportEnvironment(id);
	}
	importCollection(workspaceId: string): Promise<void> {
		return ImportCollection(workspaceId);
	}
	importEnvironment(workspaceId: string): Promise<void> {
		return ImportEnvironment(workspaceId);
	}
}
