import { RestClient } from "@/services";
import type { Exporter, FileRepository, WebImportDTO } from "@/types";
import { WebFileRepository } from "../../repository/web/web.file.repo";

export class WebExporter implements Exporter {
	private static webExporter: WebExporter | null = null;
	private readonly restClient: RestClient;
	private _fileRepo: FileRepository;

	private constructor() {
		this._fileRepo = WebFileRepository.getInstance();
		this.restClient = RestClient.getInstance();
	}

	static getInstance() {
		if (!WebExporter.webExporter) {
			WebExporter.webExporter = new WebExporter();
		}

		return WebExporter.webExporter;
	}

	async exportCollection(id: string, name: string): Promise<void> {
		const blob = await this.restClient.downloadFile(`export/collection/${id}`);

		const downloadURL = window.URL.createObjectURL(blob);

		const a = document.createElement("a");

		a.href = downloadURL;
		a.download = `${name}.collection.json`;
		a.click();
		window.URL.revokeObjectURL(downloadURL);
	}
	async exportEnvironment(id: string, name: string): Promise<void> {
		const blob = await this.restClient.downloadFile(`export/env/${id}`);

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

		await this.restClient.post("import/collection", payload);
	}

	async importEnvironment(workspaceId: string, file: File): Promise<void> {
		const { path } = await this._fileRepo.chooseFile(file);

		const payload: WebImportDTO = {
			file_path: path,
			workspace_id: workspaceId,
		};

		await this.restClient.post("import/env", payload);
	}
}
