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
		const data = await this.restClient.get<Array<models.RequestLightDTO>>(
			this._reqBaseUrl,
			query,
		);

		return data;
	}

	async saveRequestCopy(
		sourceId: string,
		arg1: models.SaveRequestCopyDTO,
	): Promise<void> {
		return this.restClient.post(`${this._reqBaseUrl}/${sourceId}`, arg1);
	}

	async deleteSavedReq(id: string): Promise<void> {
		return this.restClient.delete(`${this._reqBaseUrl}/${id}`);
	}

	async deleteRequestDrafts(id: string): Promise<void> {
		return this.restClient.delete(`${this._reqBaseUrl}/${id}/drafts`);
	}

	async addDraftFromRequest(
		id: string,
		arg1: models.AddDraftDTO,
	): Promise<void> {
		return this.restClient.post(`${this._reqBaseUrl}/${id}/drafts`, arg1);
	}

	//req-drafts

	async findDraftById(id: string): Promise<models.RequestDraftDTO | undefined> {
		return this.restClient.get<models.RequestDraftDTO>(
			`${this._reqDraftsBaseUrl}/${id}`,
		);
	}

	async addDraft(arg1: models.RequestDraftDTO): Promise<void> {
		return this.restClient.post(this._reqDraftsBaseUrl, arg1);
	}

	async addFreshDraft(arg1: models.AddDraftDTO): Promise<void> {
		return this.restClient.post(`req-drafts-fresh`, arg1);
	}

	async removeDraft(id: string): Promise<void> {
		return this.restClient.delete(`${this._reqDraftsBaseUrl}/${id}`);
	}

	async saveDraftAsRequest(
		draftId: string,
		arg1: models.SaveDraftAsReqDTO,
	): Promise<void> {
		return this.restClient.post(`${this._reqDraftsBaseUrl}/${draftId}`, arg1);
	}

	async updatereqDraftFields(
		draftId: string,
		arg: models.UpdateDraftFieldsDTO,
	): Promise<void> {
		return this.restClient.patch(`${this._reqDraftsBaseUrl}/${draftId}`, arg);
	}

	//req-examples

	async getReqExampleById(
		id: string,
	): Promise<models.ReqExampleDTO | undefined> {
		return this.restClient.get<models.ReqExampleDTO>(
			`${this._reqExampleBaseUrl}/${id}`,
		);
	}

	async getReqExamples(
		workspace: string,
	): Promise<Array<models.ReqExampleLightDTO> | null | undefined> {
		const query = new URLSearchParams({
			workspace_id: workspace,
		});
		return this.restClient.get<Array<models.ReqExampleLightDTO>>(
			this._reqExampleBaseUrl,
			query,
		);
	}

	async addReqExample(
		arg1: models.ReqExampleDTO,
		arg2: models.SavedResponseRenderMeta,
	): Promise<void> {
		return this.restClient.post(this._reqExampleBaseUrl, {
			example: arg1,
			metadata: arg2,
		});
	}

	async deleteReqExample(id: string): Promise<void> {
		return this.restClient.delete(`${this._reqExampleBaseUrl}/${id}`);
	}
}
