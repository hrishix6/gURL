import type { models } from "@wailsjs/go/models";
import { getAppConfig } from "@/app.config";
import type { ApiResponse, CollectionRepository } from "@/types";

export class WebCollectionRepository implements CollectionRepository {
	private _baseURL: string;

	private static webCollectionRepo: WebCollectionRepository | null = null;

	private constructor() {
		this._baseURL = getAppConfig().backend_url;
		this._baseURL = `${this._baseURL}/collections`;
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
		}).toString();

		const res = await fetch(`${this._baseURL}?${query}`);

		if (!res.ok) {
			throw new Error("failed to load collections state from backend");
		}

		const { data }: ApiResponse<Array<models.CollectionDTO>> = await res.json();

		return data;
	}

	async addCollection(dto: models.CreateCollectionDTO): Promise<void> {
		const res = await fetch(`${this._baseURL}`, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify(dto),
		});

		if (!res.ok) {
			throw new Error("failed to create collection in backend");
		}
	}

	async clearCollection(id: string): Promise<void> {
		const res = await fetch(`${this._baseURL}/${id}/clear`, {
			method: "POST",
		});

		if (!res.ok) {
			throw new Error("failed to clear collection in backend");
		}
	}
	async deleteCollection(id: string): Promise<void> {
		const res = await fetch(`${this._baseURL}/${id}`, {
			method: "DELETE",
		});

		if (!res.ok) {
			throw new Error("failed to delete collection in backend");
		}
	}
	async deleteDraftsUnderCollection(id: string): Promise<void> {
		const res = await fetch(`${this._baseURL}/${id}/drafts`, {
			method: "DELETE",
		});

		if (!res.ok) {
			throw new Error(
				"failed to soft delete drafts under collection in backend",
			);
		}
	}
	async renameCollection(id: string, name: string): Promise<void> {
		const res = await fetch(`${this._baseURL}/${id}/rename`, {
			method: "POST",
			headers: {
				"Content-type": "application/json",
			},
			body: JSON.stringify({ name }),
		});

		if (!res.ok) {
			throw new Error("failed to rename collection in backend");
		}
	}
}
