import type { models } from "@wailsjs/go/models";
import { getAppConfig } from "@/app.config";
import type { ApiResponse, EnvironmentRepository } from "@/types";

export class WebEnvRepository implements EnvironmentRepository {
	private _baseUrl: string;
	private _envBaseUrl: string;
	private _envDraftsBaseUrl: string;

	private static webEnvRepo: WebEnvRepository | null = null;

	private constructor() {
		const baseUrl = getAppConfig().backend_url;
		this._baseUrl = baseUrl;
		this._envBaseUrl = `${baseUrl}/envs`;
		this._envDraftsBaseUrl = `${baseUrl}/env-drafts`;
	}

	static getInstance() {
		if (!WebEnvRepository.webEnvRepo) {
			WebEnvRepository.webEnvRepo = new WebEnvRepository();
		}

		return WebEnvRepository.webEnvRepo;
	}

	async getEnvironments(
		workspace: string,
	): Promise<Array<models.EnvironmentDTO> | null | undefined> {
		const query = new URLSearchParams({
			workspace_id: workspace,
		}).toString();

		const res = await fetch(`${this._envBaseUrl}?${query}`);

		if (!res.ok) {
			throw new Error("failed to load environments state from backend");
		}

		const { data }: ApiResponse<Array<models.EnvironmentDTO>> =
			await res.json();

		return data;
	}

	async copyEnvironment(
		sourceId: string,
		arg1: models.CopyEnvironmentDTO,
	): Promise<void> {
		const res = await fetch(`${this._envBaseUrl}/${sourceId}`, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify(arg1),
		});

		if (!res.ok) {
			throw new Error("failed to copy environment in backend");
		}
	}

	async removeEnv(id: string): Promise<void> {
		const res = await fetch(`${this._envBaseUrl}/${id}`, {
			method: "DELETE",
		});

		if (!res.ok) {
			throw new Error("failed to delete environment in backend");
		}
	}

	async deleteEnvDraftsUnderEnv(id: string): Promise<void> {
		const res = await fetch(`${this._envBaseUrl}/${id}/drafts`, {
			method: "DELETE",
		});

		if (!res.ok) {
			throw new Error("failed to delete drafts under environment in backend");
		}
	}

	async findEnvDraft(id: string): Promise<models.EnvironmentDraftDTO> {
		const res = await fetch(`${this._envDraftsBaseUrl}/${id}`);

		if (!res.ok) {
			throw new Error("failed to load environment draft from backend");
		}

		const { data }: ApiResponse<models.EnvironmentDraftDTO> = await res.json();

		if (!data) {
			throw new Error("received invalid environment draft from backend");
		}

		return data;
	}

	async addEnvironmentDraft(
		arg1: models.AddEnvironmentDraftDTO,
	): Promise<void> {
		const res = await fetch(`${this._envDraftsBaseUrl}`, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify(arg1),
		});

		if (!res.ok) {
			throw new Error(
				"failed to create environment draft from given env in backend",
			);
		}
	}

	async addFreshEnvDraft(draftId: string): Promise<void> {
		const res = await fetch(`${this._baseUrl}/env-drafts-fresh`, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify({
				draftId,
			}),
		});

		if (!res.ok) {
			throw new Error("failed to create fresh environment draft in backend");
		}
	}

	async removeEnvDraft(draftId: string): Promise<void> {
		const res = await fetch(`${this._envDraftsBaseUrl}/${draftId}`, {
			method: "DELETE",
		});

		if (!res.ok) {
			throw new Error("failed to delete env draft in backend");
		}
	}

	async saveEnvDraftAsEnv(
		draftId: string,
		arg1: models.SaveEnvDraftAsEnvDTO,
	): Promise<void> {
		const res = await fetch(`${this._envDraftsBaseUrl}/${draftId}`, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify(arg1),
		});

		if (!res.ok) {
			throw new Error("failed to create environment from draft in backend");
		}
	}

	async updateEnvDraftData(
		draftId: string,
		arg1: models.UpdateEnvDraftDataDTO,
	): Promise<void> {
		const res = await fetch(`${this._envDraftsBaseUrl}/${draftId}`, {
			method: "PATCH",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify(arg1),
		});

		if (!res.ok) {
			throw new Error("failed to update environment draft in backend");
		}
	}
}
