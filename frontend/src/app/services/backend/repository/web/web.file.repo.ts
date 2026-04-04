import type { models } from "@wailsjs/go/models";
import { nanoid } from "nanoid";
import { RestClient } from "@/services";
import type { FileRepository } from "@/types";

export class WebFileRepository implements FileRepository {
	private readonly restClient: RestClient;
	private static webFileRepo: WebFileRepository | null = null;

	private constructor() {
		this.restClient = RestClient.getInstance();
	}

	static getInstance() {
		if (!WebFileRepository.webFileRepo) {
			WebFileRepository.webFileRepo = new WebFileRepository();
		}

		return WebFileRepository.webFileRepo;
	}

	async saveFile(dto: models.DownloadTmpFileDTO): Promise<void> {
		const blob = await this.restClient.downloadFilePost(
			"exec/tmp/download",
			dto,
		);
		const downloadURL = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = downloadURL;
		a.download = dto.file_name;
		a.click();
		window.URL.revokeObjectURL(downloadURL);
	}

	async chooseFile(file?: File): Promise<models.FileStats> {
		if (!file) {
			throw new Error("file is required");
		}

		const q = new URLSearchParams({
			file_id: nanoid(),
		});

		const result = await this.restClient.uploadFile<string>(
			"exec/tmp/upload",
			file,
			q,
		);

		if (!result.success) {
			throw new Error("failed to upload file");
		}

		return {
			name: file.name,
			size: file.size,
			path: result.data,
		};
	}
}
