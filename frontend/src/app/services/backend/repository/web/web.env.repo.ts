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

		return this.restClient.get<Array<models.EnvironmentDTO>>(
			this._envBaseUrl,
			query,
		);
	}

	async copyEnvironment(
		sourceId: string,
		arg1: models.CopyEnvironmentDTO,
	): Promise<void> {
		return this.restClient.post(`${this._envBaseUrl}/${sourceId}`, arg1);
	}

	async removeEnv(id: string): Promise<void> {
		return this.restClient.delete(`${this._envBaseUrl}/${id}`);
	}

	async deleteEnvDraftsUnderEnv(id: string): Promise<void> {
		return this.restClient.delete(`${this._envBaseUrl}/${id}/drafts`);
	}

	async findEnvDraft(
		id: string,
	): Promise<models.EnvironmentDraftDTO | undefined> {
		return this.restClient.get<models.EnvironmentDraftDTO>(
			`${this._envDraftsBaseUrl}/${id}`,
		);
	}

	async addEnvironmentDraft(
		arg1: models.AddEnvironmentDraftDTO,
	): Promise<void> {
		return this.restClient.post(this._envDraftsBaseUrl, arg1);
	}

	async addFreshEnvDraft(draftId: string): Promise<void> {
		return this.restClient.post("env-drafts-fresh", { draftId });
	}

	async removeEnvDraft(draftId: string): Promise<void> {
		return this.restClient.delete(`${this._envDraftsBaseUrl}/${draftId}`);
	}

	async saveEnvDraftAsEnv(
		draftId: string,
		arg1: models.SaveEnvDraftAsEnvDTO,
	): Promise<void> {
		return this.restClient.post(`${this._envDraftsBaseUrl}/${draftId}`, arg1);
	}

	async updateEnvDraftData(
		draftId: string,
		arg1: models.UpdateEnvDraftDataDTO,
	): Promise<void> {
		return this.restClient.patch(`${this._envDraftsBaseUrl}/${draftId}`, arg1);
	}
}
