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

		return this.restClient.get<Array<models.CollectionDTO>>(
			this._baseURL,
			query,
		);
	}

	async addCollection(dto: models.CreateCollectionDTO): Promise<void> {
		return this.restClient.post(this._baseURL, dto);
	}

	async clearCollection(id: string): Promise<void> {
		return this.restClient.post(`${this._baseURL}/${id}/clear`, undefined);
	}
	async deleteCollection(id: string): Promise<void> {
		return this.restClient.delete(`${this._baseURL}/${id}`);
	}
	async deleteDraftsUnderCollection(id: string): Promise<void> {
		return this.restClient.delete(`${this._baseURL}/${id}/drafts`);
	}
	async renameCollection(id: string, name: string): Promise<void> {
		return this.restClient.post(`${this._baseURL}/${id}/rename`, { name });
	}
}
