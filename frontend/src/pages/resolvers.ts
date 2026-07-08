import type { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import type { models } from "@wailsjs/go/models";
import { getUIStateRepository, getWorkspaceRepository } from "@/services";

export const appDataResolver: ResolveFn<
	models.UIStateDTO | null
> = async () => {
	try {
		// TODO: REMOVE
		await new Promise((res) => setTimeout(res, 1000));
		const uiStateRepo = getUIStateRepository();
		const uiState = await uiStateRepo.getUIState();
		return uiState;
	} catch (_error) {
		return null;
	}
};

export const workspaceDataResolver: ResolveFn<
	models.WorkspaceDTO | null
> = async (route: ActivatedRouteSnapshot) => {
	try {
		const activeWorkspace = route.paramMap.get("id");
		if (!activeWorkspace) {
			console.log(`user has no active workspace`);
			return null;
		}
		console.log(`loading workspace ${activeWorkspace} data for user`);
		const workspaceRepo = getWorkspaceRepository();
		const data = await workspaceRepo.getWorkspaceById(activeWorkspace);

		if (!data) {
			return null;
		}

		return data;
	} catch (_error) {
		// TODO: handle resolver errors
		return null;
	}
};

export const activeWorkspaceResolver: ResolveFn<string> = async (
	route: ActivatedRouteSnapshot,
) => {
	const uiState = route.parent?.data["uiState"] as models.UIStateDTO;
	return uiState.activeWorkspace;
};

export const workspacesResolver: ResolveFn<
	models.WorkspaceLightDTO[]
> = async () => {
	try {
		const workspaceRepo = getWorkspaceRepository();
		const workspaces = await workspaceRepo.getWorkspaces();
		if (!workspaces) {
			return [];
		}
		return workspaces;
	} catch (_error) {
		return [];
	}
};
