import type { models } from "@wailsjs/go/models";
import type { ReqMockRepository } from "@/types";
import { RestClient } from "../../rest.client";

export class WebReqMocksRepo implements ReqMockRepository {
	private baseUrl: string;
	private draftsBaseUrl: string;
	private readonly restClient: RestClient;
	private static mockRepoInstance: WebReqMocksRepo | null = null;
	private constructor() {
		this.restClient = RestClient.getInstance();
		this.baseUrl = `mocks`;
		this.draftsBaseUrl = `mock-drafts`;
	}

	static getInstance() {
		if (!WebReqMocksRepo.mockRepoInstance) {
			WebReqMocksRepo.mockRepoInstance = new WebReqMocksRepo();
		}

		return WebReqMocksRepo.mockRepoInstance;
	}

	async getMocks(q: models.MockQueryDTO): Promise<models.MockLightDTO[]> {
		const query = new URLSearchParams({
			...q,
		});
		const result = await this.restClient.get<Array<models.MockLightDTO>>(
			this.baseUrl,
			query,
		);

		if (!result.success) {
			throw new Error("Failed to get mocks");
		}

		return result.data;
	}

	async deleteMockById(id: string): Promise<void> {
		const result = await this.restClient.delete<void>(`${this.baseUrl}/${id}`);

		if (!result.success) {
			throw new Error("Failed to delete mock");
		}

		return result.data;
	}

	async saveMockDraftAsMock(
		draftId: string,
		dto: models.SaveMockDraftAsMock,
	): Promise<models.MockDraftDTO> {
		const result = await this.restClient.post<models.MockDraftDTO>(
			`${this.draftsBaseUrl}/${draftId}`,
			dto,
		);

		if (!result.success) {
			throw new Error("Failed to create mock from draft");
		}

		return result.data;
	}

	async getMockById(id: string): Promise<models.MockLightDTO> {
		const result = await this.restClient.get<models.MockLightDTO>(
			`${this.baseUrl}/${id}`,
		);

		if (!result.success) {
			throw new Error("Failed to get mocks");
		}

		return result.data;
	}

	async getMockDraftById(id: string): Promise<models.MockDraftDTO> {
		const result = await this.restClient.get<models.MockDraftDTO>(
			`${this.draftsBaseUrl}/${id}`,
		);

		if (!result.success) {
			throw new Error("Failed to get mocks");
		}

		return result.data;
	}

	async deleteMockDraftById(id: string): Promise<void> {
		const result = await this.restClient.delete<void>(
			`${this.draftsBaseUrl}/${id}`,
		);

		if (!result.success) {
			throw new Error("Failed to delete mock draft");
		}

		return result.data;
	}

	async createMockDraftFromMock(
		mockId: string,
		dto: models.AddDraftDTO,
	): Promise<void> {
		const result = await this.restClient.post<void>(
			`${this.baseUrl}/${mockId}/drafts`,
			dto,
		);

		if (!result.success) {
			throw new Error("Failed to add draft from mock");
		}

		return result.data;
	}

	async updateMockDraftFields(
		id: string,
		dto: models.UpdateMockDraftFields,
	): Promise<void> {
		const result = await this.restClient.patch<void>(
			`${this.draftsBaseUrl}/${id}`,
			dto,
		);

		if (!result.success) {
			throw new Error("Failed to update mock draft");
		}

		return result.data;
	}

	async createFreshMockDraft(dto: models.AddDraftDTO): Promise<void> {
		const result = await this.restClient.post<void>("mock-drafts-fresh", dto);

		if (!result.success) {
			throw new Error("Failed to add fresh draft mock");
		}

		return result.data;
	}

	async copyMockWithId(id: string): Promise<models.MockLightDTO> {
		const result = await this.restClient.post<models.MockLightDTO>(
			`${this.baseUrl}/${id}`,
			undefined,
		);

		if (!result.success) {
			throw new Error("Failed to copy mock");
		}

		return result.data;
	}
}
