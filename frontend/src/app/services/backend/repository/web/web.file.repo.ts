import type { models } from "@wailsjs/go/models";
import { nanoid } from "nanoid";
import { getAppConfig } from "@/app.config";
import type { ApiResponse, FileRepository } from "@/types";

export class WebFileRepository implements FileRepository {
	private _baseUrl: string;
	private static webFileRepo: WebFileRepository | null = null;

	private constructor() {
		this._baseUrl = getAppConfig().backend_url;
	}

	static getInstance() {
		if (!WebFileRepository.webFileRepo) {
			WebFileRepository.webFileRepo = new WebFileRepository();
		}

		return WebFileRepository.webFileRepo;
	}

	async saveFile(dto: models.DownloadTmpFileDTO): Promise<void> {
		const res = await fetch(`${this._baseUrl}/exec/tmp/download`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(dto),
		});

		if (!res.ok) {
			throw new Error("Unable to download file");
		}

		const blob = await res.blob();

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
		}).toString();

		const res = await fetch(`${this._baseUrl}/exec/tmp/upload?${q}`, {
			method: "PUT",
			body: file,
		});

		if (!res.ok) {
			throw new Error("Unable to upload tmp file");
		}

		const { data }: ApiResponse<string> = await res.json();

		return {
			name: file.name,
			size: file.size,
			path: data || "",
		};
	}
}
