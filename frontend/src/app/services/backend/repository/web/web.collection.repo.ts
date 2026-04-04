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

	async getAllCollections(
		workspace: string,
	): Promise<Array<models.CollectionDTO> | null | undefined> {
		const query = new URLSearchParams({
			workspace_id: workspace,
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
	async deleteDraftsUnderCollection(id: string): Promise<void> {
		const result = await this.restClient.delete<void>(
			`${this._baseURL}/${id}/drafts`,
		);

		if (!result.success) {
			throw new Error("Failed to delete drafts under collection");
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
}
