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
		const data = await this.restClient.get<models.UIStateDTO>("ui");

		if (!data) {
			throw new Error("received null UI state from backend");
		}

		return data;
	}

	async updateUIState(arg: models.UpdateUIStateDTO): Promise<void> {
		await this.restClient.patch(`ui`, arg);
	}
}
