import type { models } from "@wailsjs/go/models";
import { getAppConfig } from "@/app.config";
import type { ApiResponse, RequestRepository } from "@/types";

export class WebReqRepository implements RequestRepository {
	private _baseUrl: string;
	private _reqBaseUrl: string;
	private _reqDraftsBaseUrl: string;
	private _reqExampleBaseUrl: string;

	private static webReqRepo: WebReqRepository | null = null;

	private constructor() {
		const baseUrl = getAppConfig().backend_url;
		this._baseUrl = baseUrl;
		this._reqBaseUrl = `${baseUrl}/reqs`;
		this._reqDraftsBaseUrl = `${baseUrl}/req-drafts`;
		this._reqExampleBaseUrl = `${baseUrl}/req-examples`;
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
	): Promise<Array<models.RequestLightDTO> | null | undefined> {
		const query = new URLSearchParams({
			workspace_id: workspace,
		}).toString();

		const res = await fetch(`${this._reqBaseUrl}?${query}`);

		if (!res.ok) {
			throw new Error("failed to load requests state from backend");
		}

		const { data }: ApiResponse<Array<models.RequestLightDTO>> =
			await res.json();

		return data;
	}

	async saveRequestCopy(
		sourceId: string,
		arg1: models.SaveRequestCopyDTO,
	): Promise<void> {
		const res = await fetch(`${this._reqBaseUrl}/${sourceId}`, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify(arg1),
		});

		if (!res.ok) {
			throw new Error("failed to copy req in backend");
		}
	}

	async deleteSavedReq(id: string): Promise<void> {
		const res = await fetch(`${this._reqBaseUrl}/${id}`, {
			method: "DELETE",
		});

		if (!res.ok) {
			throw new Error("failed to delete req in backend");
		}
	}

	async deleteRequestDrafts(id: string): Promise<void> {
		const res = await fetch(`${this._reqBaseUrl}/${id}/drafts`, {
			method: "DELETE",
		});

		if (!res.ok) {
			throw new Error("failed to delete drafts under req in backend");
		}
	}

	async addDraftFromRequest(
		id: string,
		arg1: models.AddDraftDTO,
	): Promise<void> {
		const res = await fetch(`${this._reqBaseUrl}/${id}/drafts`, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify(arg1),
		});

		if (!res.ok) {
			throw new Error("failed to create draft from req in backend");
		}
	}

	//req-drafts

	async findDraftById(id: string): Promise<models.RequestDraftDTO> {
		const res = await fetch(`${this._reqDraftsBaseUrl}/${id}`);

		if (!res.ok) {
			throw new Error("failed to load req draft from backend");
		}

		const { data }: ApiResponse<models.RequestDraftDTO> = await res.json();

		if (!data) {
			throw new Error("received invalid req draft from backend");
		}

		return data;
	}

	async addDraft(arg1: models.RequestDraftDTO): Promise<void> {
		const res = await fetch(`${this._reqDraftsBaseUrl}`, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify(arg1),
		});

		if (!res.ok) {
			throw new Error("failed to create draft in backend");
		}
	}

	async addFreshDraft(arg1: models.AddDraftDTO): Promise<void> {
		const res = await fetch(`${this._baseUrl}/req-drafts-fresh`, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify(arg1),
		});

		if (!res.ok) {
			throw new Error("failed to create fresh req draft in backend");
		}
	}

	async removeDraft(id: string): Promise<void> {
		const res = await fetch(`${this._reqDraftsBaseUrl}/${id}`, {
			method: "DELETE",
		});

		if (!res.ok) {
			throw new Error("failed to delete req draft in backend");
		}
	}

	async saveDraftAsRequest(
		draftId: string,
		arg1: models.SaveDraftAsReqDTO,
	): Promise<void> {
		const res = await fetch(`${this._reqDraftsBaseUrl}/${draftId}`, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify(arg1),
		});

		if (!res.ok) {
			throw new Error("failed to create req from draft in backend");
		}
	}

	async updatereqDraftFields(
		draftId: string,
		arg: models.UpdateDraftFieldsDTO,
	): Promise<void> {
		const res = await fetch(`${this._reqDraftsBaseUrl}/${draftId}`, {
			method: "PATCH",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify(arg),
		});

		if (!res.ok) {
			throw new Error("failed to update req draft fields in backend");
		}
	}

	//req-examples

	async getReqExampleById(id: string): Promise<models.ReqExampleDTO> {
		const res = await fetch(`${this._reqExampleBaseUrl}/${id}`);

		if (!res.ok) {
			throw new Error("failed to load req-example from backend");
		}

		const { data }: ApiResponse<models.ReqExampleDTO> = await res.json();

		if (!data) {
			throw new Error("received invalid req-example data from backend");
		}

		return data;
	}

	async getReqExamples(
		workspace: string,
	): Promise<Array<models.ReqExampleLightDTO> | null | undefined> {
		const query = new URLSearchParams({
			workspace_id: workspace,
		}).toString();

		const res = await fetch(`${this._reqExampleBaseUrl}?${query}`);

		if (!res.ok) {
			throw new Error("failed to load request-examples state from backend");
		}

		const { data }: ApiResponse<Array<models.ReqExampleLightDTO>> =
			await res.json();

		return data;
	}

	async addReqExample(
		arg1: models.ReqExampleDTO,
		arg2: models.SavedResponseRenderMeta,
	): Promise<void> {
		const res = await fetch(`${this._reqExampleBaseUrl}`, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify({
				example: arg1,
				metadata: arg2,
			}),
		});

		if (!res.ok) {
			throw new Error("failed to create req-example in backend");
		}
	}

	async deleteReqExample(id: string): Promise<void> {
		const res = await fetch(`${this._reqExampleBaseUrl}/${id}`, {
			method: "DELETE",
		});

		if (!res.ok) {
			throw new Error("failed to delete req-example in backend");
		}
	}
}
