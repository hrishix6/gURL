import type { models } from "@wailsjs/go/models";
import { RestClient } from "@/services";
import type { RequestRepository } from "@/types";

export class WebReqRepository implements RequestRepository {
	private _reqBaseUrl: string;
	private _reqDraftsBaseUrl: string;
	private _reqExampleBaseUrl: string;
	private readonly restClient: RestClient;

	private static webReqRepo: WebReqRepository | null = null;

	private constructor() {
		this.restClient = RestClient.getInstance();
		this._reqBaseUrl = `reqs`;
		this._reqDraftsBaseUrl = `req-drafts`;
		this._reqExampleBaseUrl = `req-examples`;
	}

	static getInstance() {
		if (!WebReqRepository.webReqRepo) {
			WebReqRepository.webReqRepo = new WebReqRepository();
		}

		return WebReqRepository.webReqRepo;
	}

	//reqs
	async getSavedRequests(
		workspace: string,
	): Promise<Array<models.RequestLightDTO> | undefined> {
		const query = new URLSearchParams({
			workspace_id: workspace,
		});
		const result = await this.restClient.get<Array<models.RequestLightDTO>>(
			this._reqBaseUrl,
			query,
		);

		if (!result.success) {
			throw new Error("Failed to get saved requests");
		}

		return result.data;
	}

	async saveRequestCopy(
		sourceId: string,
		arg1: models.SaveRequestCopyDTO,
	): Promise<void> {
		const result = await this.restClient.post<void>(
			`${this._reqBaseUrl}/${sourceId}`,
			arg1,
		);

		if (!result.success) {
			throw new Error("Failed to save request copy");
		}

		return result.data;
	}

	async deleteSavedReq(id: string): Promise<void> {
		const result = await this.restClient.delete<void>(
			`${this._reqBaseUrl}/${id}`,
		);

		if (!result.success) {
			throw new Error("Failed to delete request");
		}

		return result.data;
	}

	async deleteRequestDrafts(id: string): Promise<void> {
		const result = await this.restClient.delete<void>(
			`${this._reqBaseUrl}/${id}/drafts`,
		);

		if (!result.success) {
			throw new Error("Failed to delete request drafts");
		}

		return result.data;
	}

	async addDraftFromRequest(
		id: string,
		arg1: models.AddDraftDTO,
	): Promise<void> {
		const result = await this.restClient.post<void>(
			`${this._reqBaseUrl}/${id}/drafts`,
			arg1,
		);

		if (!result.success) {
			throw new Error("Failed to create draft");
		}

		return result.data;
	}

	//req-drafts

	async findDraftById(id: string): Promise<models.RequestDraftDTO | undefined> {
		const result = await this.restClient.get<models.RequestDraftDTO>(
			`${this._reqDraftsBaseUrl}/${id}`,
		);

		if (!result.success) {
			throw new Error("Failed to find draft by id");
		}

		return result.data;
	}

	async addDraft(arg1: models.RequestDraftDTO): Promise<void> {
		const result = await this.restClient.post<void>(
			this._reqDraftsBaseUrl,
			arg1,
		);

		if (!result.success) {
			throw new Error("Failed to add draft");
		}

		return result.data;
	}

	async addFreshDraft(arg1: models.AddDraftDTO): Promise<void> {
		const result = await this.restClient.post<void>(`req-drafts-fresh`, arg1);

		if (!result.success) {
			throw new Error("Failed to add fresh draft");
		}

		return result.data;
	}

	async removeDraft(id: string): Promise<void> {
		const result = await this.restClient.delete<void>(
			`${this._reqDraftsBaseUrl}/${id}`,
		);

		if (!result.success) {
			throw new Error("Failed to delete draft");
		}

		return result.data;
	}

	async saveDraftAsRequest(
		draftId: string,
		arg1: models.SaveDraftAsReqDTO,
	): Promise<void> {
		const result = await this.restClient.post<void>(
			`${this._reqDraftsBaseUrl}/${draftId}`,
			arg1,
		);

		if (!result.success) {
			throw new Error("Failed to save draft as request");
		}

		return result.data;
	}

	async updatereqDraftFields(
		draftId: string,
		arg: models.UpdateDraftFieldsDTO,
	): Promise<void> {
		const result = await this.restClient.patch<void>(
			`${this._reqDraftsBaseUrl}/${draftId}`,
			arg,
		);

		if (!result.success) {
			throw new Error("Failed to update draft fields");
		}

		return result.data;
	}

	//req-examples

	async getReqExampleById(
		id: string,
	): Promise<models.ReqExampleDTO | undefined> {
		const result = await this.restClient.get<models.ReqExampleDTO>(
			`${this._reqExampleBaseUrl}/${id}`,
		);

		if (!result.success) {
			throw new Error("Failed to get request example by id");
		}

		return result.data;
	}

	async getReqExamples(
		workspace: string,
	): Promise<Array<models.ReqExampleLightDTO> | null | undefined> {
		const query = new URLSearchParams({
			workspace_id: workspace,
		});
		const result = await this.restClient.get<Array<models.ReqExampleLightDTO>>(
			this._reqExampleBaseUrl,
			query,
		);

		if (!result.success) {
			throw new Error("Failed to get request examples");
		}

		return result.data;
	}

	async addReqExample(
		arg1: models.ReqExampleDTO,
		arg2: models.SavedResponseRenderMeta,
	): Promise<void> {
		const result = await this.restClient.post<void>(this._reqExampleBaseUrl, {
			example: arg1,
			metadata: arg2,
		});

		if (!result.success) {
			throw new Error("Failed to add request example");
		}

		return result.data;
	}

	async deleteReqExample(id: string): Promise<void> {
		const result = await this.restClient.delete<void>(
			`${this._reqExampleBaseUrl}/${id}`,
		);

		if (!result.success) {
			throw new Error("Failed to delete request example");
		}

		return result.data;
	}
}
