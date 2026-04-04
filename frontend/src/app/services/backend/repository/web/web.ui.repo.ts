import type { models } from "@wailsjs/go/models";
import { RestClient } from "@/services";
import type { UIStateRepository } from "@/types";

export class WebUIStateRepository implements UIStateRepository {
	private static webUIStateRepo: WebUIStateRepository | null = null;
	private readonly restClient: RestClient;

	private constructor() {
		this.restClient = RestClient.getInstance();
	}

	static getInstance() {
		if (!WebUIStateRepository.webUIStateRepo) {
			WebUIStateRepository.webUIStateRepo = new WebUIStateRepository();
		}

		return WebUIStateRepository.webUIStateRepo;
	}

	async getUIState(): Promise<models.UIStateDTO> {
		const result = await this.restClient.get<models.UIStateDTO>("ui");

		if (!result.success) {
			throw new Error("failed to retrieve ui state");
		}

		if (!result.data) {
			throw new Error("received null UI state from backend");
		}

		return result.data;
	}

	async updateUIState(arg: models.UpdateUIStateDTO): Promise<void> {
		const result = await this.restClient.patch<void>(`ui`, arg);

		if (!result.success) {
			throw new Error("failed to update ui state");
		}

		return result.data;
	}
}
