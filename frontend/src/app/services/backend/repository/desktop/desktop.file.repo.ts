import type { models } from "@wailsjs/go/models";
import { ChooseFile, SaveFile } from "@wailsjs/go/storage/DesktopStorage";
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

	saveFile(arg1: models.DownloadTmpFileDTO): Promise<void> {
		return SaveFile(arg1);
	}
	chooseFile(): Promise<models.FileStats> {
		return ChooseFile();
	}
}
