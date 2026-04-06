import type { models } from "@wailsjs/go/models";
import { RestClient } from "@/services";
import type { HttpExecutor } from "@/types";

export class WebHttpExecutor implements HttpExecutor {
	private readonly restClient: RestClient;
	private _execBasePath: string;
	private static webHttpExec: WebHttpExecutor | null = null;

	private constructor() {
		this._execBasePath = `exec`;
		this.restClient = RestClient.getInstance();
	}

	static getInstance() {
		if (!WebHttpExecutor.webHttpExec) {
			WebHttpExecutor.webHttpExec = new WebHttpExecutor();
		}

		return WebHttpExecutor.webHttpExec;
	}

	async cancelReq(id: string): Promise<void> {
		const result = await this.restClient.put<void>(
			`${this._execBasePath}/${id}/cancel`,
			undefined,
		);

		if (!result.success) {
			throw new Error("Failed to cancel request");
		}

		return result.data;
	}
	async getSavedResponsesSrc(filePath: string): Promise<string> {
		const result = await this.restClient.post<string>(
			`${this._execBasePath}/src_path`,
			{
				saved_res_path: filePath,
			},
		);

		if (!result.success) {
			throw new Error("failed to retrive saved response src");
		}

		if (!result.data) {
			throw new Error("received invalid response src from backend");
		}

		return result.data;
	}

	async parseCookieRaw(text: string): Promise<Array<models.GurlKeyValItem>> {
		const result = await this.restClient.post<Array<models.GurlKeyValItem>>(
			`${this._execBasePath}/parse_cookie`,
			{ cookie: text },
		);

		if (!result.success) {
			throw new Error("failed to retrive parsed cookies");
		}

		if (!result.data) {
			throw new Error("received invalid parse cookie response from backend");
		}

		return result.data;
	}

	async sendHttpReq(arg1: models.GurlReq): Promise<models.GurlRes> {
		const result = await this.restClient.post<models.GurlRes>(
			this._execBasePath,
			arg1,
			undefined,
			true,
		);

		if (!result.success) {
			throw new Error(
				"received invalid execute http req response from backend",
			);
		}

		return result.data;
	}
}
