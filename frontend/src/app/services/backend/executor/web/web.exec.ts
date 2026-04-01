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
		return this.restClient.put(`${this._execBasePath}/${id}/cancel`, undefined);
	}
	async getSavedResponsesSrc(filePath: string): Promise<string> {
		const data = await this.restClient.post<string>(
			`${this._execBasePath}/src_path`,
			{
				saved_res_path: filePath,
			},
		);

		if (!data) {
			throw new Error("received invalid response src from backend");
		}

		return data;
	}

	async parseCookieRaw(text: string): Promise<Array<models.GurlKeyValItem>> {
		const data = await this.restClient.post<Array<models.GurlKeyValItem>>(
			`${this._execBasePath}/parse_cookie`,
			{ cookie: text },
		);

		if (!data) {
			throw new Error("received invalid parse cookie response from backend");
		}

		return data;
	}

	async sendHttpReq(arg1: models.GurlReq): Promise<models.GurlRes> {
		const data = await this.restClient.post<models.GurlRes>(
			this._execBasePath,
			arg1,
		);

		if (!data) {
			throw new Error(
				"received invalid execute http req response from backend",
			);
		}

		return data;
	}
}
