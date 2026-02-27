import type { models } from "@wailsjs/go/models";
import { GetUIState, UpdateUIState } from "@wailsjs/go/storage/Storage";
import type { UIStateRepository } from "@/types";

export class DesktopUIStateRepository implements UIStateRepository {
	private static desktopUIStateRepo: DesktopUIStateRepository | null = null;

	private constructor() {}

	static getInstance() {
		if (!DesktopUIStateRepository.desktopUIStateRepo) {
			DesktopUIStateRepository.desktopUIStateRepo =
				new DesktopUIStateRepository();
		}

		return DesktopUIStateRepository.desktopUIStateRepo;
	}

	getUIState(): Promise<models.UIStateDTO> {
		return GetUIState();
	}

	updateUIState(arg: models.UpdateUIStateDTO): Promise<void> {
		return UpdateUIState(arg);
	}
}
