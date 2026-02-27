import type { models } from "@wailsjs/go/models";
import {
	AddEnvironmentDraft,
	AddFreshEnvDraft,
	CopyEnvironment,
	DeleteEnvDraftsUnderEnv,
	FindEnvDraft,
	GetEnvironments,
	RemoveEnv,
	RemoveEnvDraft,
	SaveEnvDraftAsEnv,
	UpdateEnvDraftData,
} from "@wailsjs/go/storage/Storage";
import type { EnvironmentRepository } from "@/types";

export class DesktopEnvRepository implements EnvironmentRepository {
	private static desktopEnvRepo: DesktopEnvRepository | null = null;

	private constructor() {}
	static getInstance() {
		if (!DesktopEnvRepository.desktopEnvRepo) {
			DesktopEnvRepository.desktopEnvRepo = new DesktopEnvRepository();
		}

		return DesktopEnvRepository.desktopEnvRepo;
	}

	copyEnvironment(arg1: models.CopyEnvironmentDTO): Promise<void> {
		return CopyEnvironment(arg1);
	}

	addEnvironmentDraft(arg1: models.AddEnvironmentDraftDTO): Promise<void> {
		return AddEnvironmentDraft(arg1);
	}

	addFreshEnvDraft(arg1: string): Promise<void> {
		return AddFreshEnvDraft(arg1);
	}

	getEnvironments(): Promise<Array<models.EnvironmentDTO>> {
		return GetEnvironments();
	}
	findEnvDraft(arg1: string): Promise<models.EnvironmentDraftDTO> {
		return FindEnvDraft(arg1);
	}
	removeEnv(arg1: string): Promise<void> {
		return RemoveEnv(arg1);
	}
	removeEnvDraft(arg1: string): Promise<void> {
		return RemoveEnvDraft(arg1);
	}
	saveEnvDraftAsEnv(arg1: models.SaveEnvDraftAsEnvDTO): Promise<void> {
		return SaveEnvDraftAsEnv(arg1);
	}
	updateEnvDraftData(arg1: models.UpdateEnvDraftDataDTO): Promise<void> {
		return UpdateEnvDraftData(arg1);
	}
	deleteEnvDraftsUnderEnv(arg1: string): Promise<void> {
		return DeleteEnvDraftsUnderEnv(arg1);
	}
}
