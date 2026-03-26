import { getAppConfig } from "@/app.config";
import type { Exporter, FileRepository, WebImportDTO } from "@/types";
import { WebFileRepository } from "../../repository/web/web.file.repo";

export class WebExporter implements Exporter {
	private _baseURL: string;
	private static webExporter: WebExporter | null = null;
	private _fileRepo: FileRepository;

	private constructor() {
		this._baseURL = getAppConfig().backend_url;
		this._fileRepo = WebFileRepository.getInstance();
	}

	static getInstance() {
		if (!WebExporter.webExporter) {
			WebExporter.webExporter = new WebExporter();
		}

		return WebExporter.webExporter;
	}

	async exportCollection(id: string, name: string): Promise<void> {
		const res = await fetch(`${this._baseURL}/export/collection/${id}`);

		if (!res.ok) {
			throw new Error("Unable to download collection export file");
		}

		const blob = await res.blob();

		const downloadURL = window.URL.createObjectURL(blob);

		const a = document.createElement("a");

		a.href = downloadURL;
		a.download = `${name}.collection.json`;
		a.click();
		window.URL.revokeObjectURL(downloadURL);
	}
	async exportEnvironment(id: string, name: string): Promise<void> {
		const res = await fetch(`${this._baseURL}/export/env/${id}`);

		if (!res.ok) {
			throw new Error("Unable to download environment export file");
		}

		const blob = await res.blob();

		const downloadURL = window.URL.createObjectURL(blob);

		const a = document.createElement("a");

		a.href = downloadURL;
		a.download = `${name}.env.json`;
		a.click();
		window.URL.revokeObjectURL(downloadURL);
	}

	async importCollection(workspaceId: string, file: File): Promise<void> {
		const { path } = await this._fileRepo.chooseFile(file);
		const payload: WebImportDTO = {
			file_path: path,
			workspace_id: workspaceId,
		};

		const res = await fetch(`${this._baseURL}/import/collection`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			throw new Error("server error: failed to import collection");
		}
	}

	async importEnvironment(workspaceId: string, file: File): Promise<void> {
		const { path } = await this._fileRepo.chooseFile(file);

		const payload: WebImportDTO = {
			file_path: path,
			workspace_id: workspaceId,
		};

		const res = await fetch(`${this._baseURL}/import/env`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			throw new Error("server error: failed to import environment");
		}
	}
}
