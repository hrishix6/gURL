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
		const result =
			await this.restClient.get<Array<models.WorkspaceLightDTO>>("workspaces");

		if (!result.success) {
			throw new Error("Failed to get workspaces");
		}

		return result.data;
	}
	async getWorkspaceById(id: string): Promise<models.WorkspaceDTO | undefined> {
		const result = await this.restClient.get<models.WorkspaceDTO>(
			`workspaces/${id}`,
		);
		if (!result.success) {
			throw new Error("Failed to get workspace by id");
		}

		return result.data;
	}

	async addWorkspace(arg: models.CreateWorkspaceDTO): Promise<void> {
		const result = await this.restClient.post<void>("workspaces", arg);

		if (!result.success) {
			throw new Error("Failed to add workspace");
		}

		return result.data;
	}
	async updateWorkspace(
		id: string,
		arg: models.UpdateWorkspaceDTO,
	): Promise<void> {
		const result = await this.restClient.patch<void>(`workspaces/${id}`, arg);

		if (!result.success) {
			throw new Error("Failed to update workspace");
		}

		return result.data;
	}
}
