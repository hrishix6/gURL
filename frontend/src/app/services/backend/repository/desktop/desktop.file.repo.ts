import type { models } from "@wailsjs/go/models";
import {
	ChooseFile,
	DownloadResponseFile,
} from "@wailsjs/go/storage/DesktopStorage";
import type { FileRepository } from "@/types";

export class DesktopFileRepository implements FileRepository {
	private static desktopFileRepo: DesktopFileRepository | null = null;

	private constructor() {}

	static getInstance() {
		if (!DesktopFileRepository.desktopFileRepo) {
			DesktopFileRepository.desktopFileRepo = new DesktopFileRepository();
		}

		return DesktopFileRepository.desktopFileRepo;
	}

	downloadResponseFile(arg1: models.DownloadTmpFileDTO): Promise<void> {
		return DownloadResponseFile(arg1);
	}
	chooseFile(): Promise<models.FileStats> {
		return ChooseFile();
	}
}
