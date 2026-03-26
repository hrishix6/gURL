import type { models } from "@wailsjs/go/models";
import { getAppConfig } from "@/app.config";
import type { ApiResponse, WorkspaceRepository } from "@/types";

export class WebWorkspaceRepository implements WorkspaceRepository {
	private _baseURL: string;
	private static webWorkspaceRepo: WebWorkspaceRepository | null = null;

	private constructor() {
		this._baseURL = getAppConfig().backend_url;
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
		const res = await fetch(`${this._baseURL}/workspaces`);

		if (!res.ok) {
			throw new Error("failed to load workspaces from backend");
		}

		const { data }: ApiResponse<Array<models.WorkspaceLightDTO>> =
			await res.json();

		return data;
	}
	async getWorkspaceById(id: string): Promise<models.WorkspaceDTO> {
		const res = await fetch(`${this._baseURL}/workspaces/${id}`);

		if (!res.ok) {
			throw new Error("failed to load workspace from backend");
		}

		const { data }: ApiResponse<models.WorkspaceDTO> = await res.json();

		if (!data) {
			throw new Error("received invalid workspace from backend");
		}

		return data;
	}

	async addWorkspace(arg: models.CreateWorkspaceDTO): Promise<void> {
		const res = await fetch(`${this._baseURL}/workspaces`, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify(arg),
		});

		if (!res.ok) {
			throw new Error("failed to create workspace in backend");
		}
	}
	async updateWorkspace(
		id: string,
		arg: models.UpdateWorkspaceDTO,
	): Promise<void> {
		const res = await fetch(`${this._baseURL}/workspaces/${id}`, {
			method: "PATCH",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify(arg),
		});

		if (!res.ok) {
			throw new Error("failed to create workspace in backend");
		}
	}
}
