import type { models } from "@wailsjs/go/models";
import { RestClient } from "@/services";
import type { EnvironmentRepository } from "@/types";

export class WebEnvRepository implements EnvironmentRepository {
	private _envBaseUrl: string;
	private _envDraftsBaseUrl: string;
	private readonly restClient: RestClient;

	private static webEnvRepo: WebEnvRepository | null = null;

	private constructor() {
		this.restClient = RestClient.getInstance();
		this._envBaseUrl = `envs`;
		this._envDraftsBaseUrl = `env-drafts`;
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
		});

		const result = await this.restClient.get<Array<models.EnvironmentDTO>>(
			this._envBaseUrl,
			query,
		);

		if (!result.success) {
			throw new Error("Failed to get environments");
		}

		return result.data;
	}

	async copyEnvironment(
		sourceId: string,
		arg1: models.CopyEnvironmentDTO,
	): Promise<void> {
		const result = await this.restClient.post<void>(
			`${this._envBaseUrl}/${sourceId}`,
			arg1,
		);

		if (!result.success) {
			throw new Error("Failed to copy environment");
		}

		return result.data;
	}

	async removeEnv(id: string): Promise<void> {
		const result = await this.restClient.delete<void>(
			`${this._envBaseUrl}/${id}`,
		);

		if (!result.success) {
			throw new Error("Failed to delete environment");
		}

		return result.data;
	}

	async deleteEnvDraftsUnderEnv(id: string): Promise<void> {
		const result = await this.restClient.delete<void>(
			`${this._envBaseUrl}/${id}/drafts`,
		);

		if (!result.success) {
			throw new Error("Failed to delete environment drafts");
		}

		return result.data;
	}

	async findEnvDraft(
		id: string,
	): Promise<models.EnvironmentDraftDTO | undefined> {
		const result = await this.restClient.get<models.EnvironmentDraftDTO>(
			`${this._envDraftsBaseUrl}/${id}`,
		);

		if (!result.success) {
			throw new Error("Failed to get environment draft by id");
		}

		return result.data;
	}

	async addEnvironmentDraft(
		arg1: models.AddEnvironmentDraftDTO,
	): Promise<void> {
		const result = await this.restClient.post<void>(
			this._envDraftsBaseUrl,
			arg1,
		);

		if (!result.success) {
			throw new Error("Failed to add environment draft");
		}

		return result.data;
	}

	async addFreshEnvDraft(draftId: string): Promise<void> {
		const result = await this.restClient.post<void>("env-drafts-fresh", {
			draftId,
		});

		if (!result.success) {
			throw new Error("Failed to get environment draft by id");
		}

		return result.data;
	}

	async removeEnvDraft(draftId: string): Promise<void> {
		const result = await this.restClient.delete<void>(
			`${this._envDraftsBaseUrl}/${draftId}`,
		);

		if (!result.success) {
			throw new Error("Failed to delete environment draft by id");
		}

		return result.data;
	}

	async saveEnvDraftAsEnv(
		draftId: string,
		arg1: models.SaveEnvDraftAsEnvDTO,
	): Promise<void> {
		const result = await this.restClient.post<void>(
			`${this._envDraftsBaseUrl}/${draftId}`,
			arg1,
		);

		if (!result.success) {
			throw new Error("Failed to save environment draft as env");
		}

		return result.data;
	}

	async updateEnvDraftData(
		draftId: string,
		arg1: models.UpdateEnvDraftDataDTO,
	): Promise<void> {
		const result = await this.restClient.patch<void>(
			`${this._envDraftsBaseUrl}/${draftId}`,
			arg1,
		);

		if (!result.success) {
			throw new Error("Failed to update environment draft data");
		}

		return result.data;
	}
}
