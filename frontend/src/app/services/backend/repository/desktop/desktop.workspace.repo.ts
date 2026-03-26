import type { models } from "@wailsjs/go/models";
import {
	CreateWorkspace,
	GetAllWorkspaces,
	GetWorkspaceById,
	UpdateWorkspace,
} from "@wailsjs/go/storage/DesktopStorage";
import type { WorkspaceRepository } from "@/types";

export class DesktopWorkspaceRepository implements WorkspaceRepository {
	private static desktopWorkspaceRepo: DesktopWorkspaceRepository | null = null;

	private constructor() {}

	static getInstance() {
		if (!DesktopWorkspaceRepository.desktopWorkspaceRepo) {
			DesktopWorkspaceRepository.desktopWorkspaceRepo =
				new DesktopWorkspaceRepository();
		}

		return DesktopWorkspaceRepository.desktopWorkspaceRepo;
	}

	getWorkspaces(): Promise<Array<models.WorkspaceLightDTO>> {
		return GetAllWorkspaces();
	}
	getWorkspaceById(id: string): Promise<models.WorkspaceDTO> {
		return GetWorkspaceById(id);
	}
	addWorkspace(arg: models.CreateWorkspaceDTO): Promise<void> {
		return CreateWorkspace(arg);
	}
	updateWorkspace(id: string, arg: models.UpdateWorkspaceDTO): Promise<void> {
		return UpdateWorkspace(id, arg);
	}
}
