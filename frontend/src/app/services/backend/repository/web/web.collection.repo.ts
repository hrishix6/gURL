import type { models } from "@wailsjs/go/models";
import { RestClient } from "@/services";
import type { CollectionRepository } from "@/types";

export class WebCollectionRepository implements CollectionRepository {
	private _baseURL: string;
	private readonly restClient: RestClient;
	private static webCollectionRepo: WebCollectionRepository | null = null;

	private constructor() {
		this.restClient = RestClient.getInstance();
		this._baseURL = "collections";
	}

	static getInstance() {
		if (!WebCollectionRepository.webCollectionRepo) {
			WebCollectionRepository.webCollectionRepo = new WebCollectionRepository();
		}

		return WebCollectionRepository.webCollectionRepo;
	}

	async getCollectionById(
		id: string,
	): Promise<models.CollectionDTO | undefined | null> {
		const result = await this.restClient.get<models.CollectionDTO>(
			`${this._baseURL}/${id}`,
		);

		if (!result.success) {
			throw new Error("failed to get collection by id");
		}

		return result.data;
	}

	async getAllCollections(
		q: models.CollectionsQueryDTO,
	): Promise<Array<models.CollectionDTO> | null | undefined> {
		const query = new URLSearchParams({
			...q,
		});

		const collectionsResponse = await this.restClient.get<
			Array<models.CollectionDTO>
		>(this._baseURL, query);

		if (!collectionsResponse.success) {
			throw new Error("failed to get collections");
		}

		return collectionsResponse.data;
	}

	async addCollection(dto: models.CreateCollectionDTO): Promise<void> {
		const result = await this.restClient.post<void>(this._baseURL, dto);

		if (!result.success) {
			throw new Error("Failed to add collection");
		}

		return result.data;
	}

	async clearCollection(id: string): Promise<void> {
		const result = await this.restClient.post<void>(
			`${this._baseURL}/${id}/clear`,
			undefined,
		);

		if (!result.success) {
			throw new Error("Failed to clear collection");
		}

		return result.data;
	}

	async deleteCollection(id: string): Promise<void> {
		const result = await this.restClient.delete<void>(`${this._baseURL}/${id}`);

		if (!result.success) {
			throw new Error("Failed to delete collection");
		}

		return result.data;
	}

	async renameCollection(id: string, name: string): Promise<void> {
		const result = await this.restClient.post<void>(
			`${this._baseURL}/${id}/rename`,
			{ name },
		);

		if (!result.success) {
			throw new Error("Failed to rename collection");
		}

		return result.data;
	}

	async createMockServer(
		query: models.CreateMockServerDTO,
	): Promise<models.CollectionDTO> {
		const result = await this.restClient.post<models.CollectionDTO>(
			`${this._baseURL}/${query.collectionId}/mockserver`,
			{},
		);

		if (!result.success) {
			throw new Error("failed to create mocks server");
		}

		return result.data;
	}
	async updateMockServer(
		id: string,
		flag: boolean,
	): Promise<models.CollectionDTO> {
		let url = `${this._baseURL}/${id}/mockserver`;

		if (flag) {
			url += "/enable";
		} else {
			url += "/disable";
		}

		const result = await this.restClient.patch<models.CollectionDTO>(url, {});

		if (!result.success) {
			throw new Error(`failed to ${flag ? "enable" : "disable"} mocks server`);
		}

		return result.data;
	}
}
