import type { models } from "@wailsjs/go/models";
import { RestClient } from "@/services";
import type { WorkspaceRepository } from "@/types";

export class WebWorkspaceRepository implements WorkspaceRepository {
	private readonly restClient: RestClient;
	private static webWorkspaceRepo: WebWorkspaceRepository | null = null;

	private constructor() {
		this.restClient = RestClient.getInstance();
	}

	static getInstance() {
		if (!WebWorkspaceRepository.webWorkspaceRepo) {
			WebWorkspaceRepository.webWorkspaceRepo = new WebWorkspaceRepository();
		}

		return WebWorkspaceRepository.webWorkspaceRepo;
	}

	async getWorkspaces(): Promise<
		Array<models.WorkspaceLightDTO> | null | undefined
	> {
		return this.restClient.get<Array<models.WorkspaceLightDTO>>("workspaces");
	}
	async getWorkspaceById(id: string): Promise<models.WorkspaceDTO | undefined> {
		return this.restClient.get<models.WorkspaceDTO>(`workspaces/${id}`);
	}

	async addWorkspace(arg: models.CreateWorkspaceDTO): Promise<void> {
		return this.restClient.post("workspaces", arg);
	}
	async updateWorkspace(
		id: string,
		arg: models.UpdateWorkspaceDTO,
	): Promise<void> {
		return this.restClient.patch(`workspaces/${id}`, arg);
	}
}
