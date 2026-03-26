import type { models } from "@wailsjs/go/models";
import { getAppConfig } from "@/app.config";
import type { ApiResponse, UIStateRepository } from "@/types";

export class WebUIStateRepository implements UIStateRepository {
	private _baseURL: string;
	private static webUIStateRepo: WebUIStateRepository | null = null;

	private constructor() {
		this._baseURL = getAppConfig().backend_url;
	}

	static getInstance() {
		if (!WebUIStateRepository.webUIStateRepo) {
			WebUIStateRepository.webUIStateRepo = new WebUIStateRepository();
		}

		return WebUIStateRepository.webUIStateRepo;
	}

	async getUIState(): Promise<models.UIStateDTO> {
		const res = await fetch(`${this._baseURL}/ui`);

		if (!res.ok) {
			throw new Error("failed to load UI state from backend");
		}

		const { data }: ApiResponse<models.UIStateDTO> = await res.json();

		if (!data) {
			throw new Error("received null UI state from backend");
		}

		return data;
	}

	async updateUIState(arg: models.UpdateUIStateDTO): Promise<void> {
		const res = await fetch(`${this._baseURL}/ui`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(arg),
		});

		if (!res.ok) {
			throw new Error("failed to update UI state in backend");
		}
	}
}
