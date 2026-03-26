import type { models } from "@wailsjs/go/models";
import { getAppConfig } from "@/app.config";
import type { ApiResponse, HttpExecutor } from "@/types";

export class WebHttpExecutor implements HttpExecutor {
	private _baseURL: string;
	private _execBasePath: string;
	private static webHttpExec: WebHttpExecutor | null = null;

	private constructor() {
		this._baseURL = getAppConfig().backend_url;
		this._execBasePath = `${this._baseURL}/exec`;
	}

	static getInstance() {
		if (!WebHttpExecutor.webHttpExec) {
			WebHttpExecutor.webHttpExec = new WebHttpExecutor();
		}

		return WebHttpExecutor.webHttpExec;
	}

	async cancelReq(id: string): Promise<void> {
		const res = await fetch(`${this._execBasePath}/${id}/cancel`, {
			method: "PUT",
		});

		if (!res.ok) {
			throw new Error("failed to cancel req in backend");
		}
	}
	async getSavedResponsesSrc(filePath: string): Promise<string> {
		const res = await fetch(`${this._execBasePath}/src_path`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				saved_res_path: filePath,
			}),
		});

		if (!res.ok) {
			throw new Error("failed to load saved response src from backend");
		}

		const { data }: ApiResponse<string> = await res.json();

		if (!data) {
			throw new Error("received invalid environments state from backend");
		}

		return data;
	}

	async parseCookieRaw(text: string): Promise<Array<models.GurlKeyValItem>> {
		const res = await fetch(`${this._execBasePath}/parse_cookie`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				cookie: text,
			}),
		});

		if (!res.ok) {
			throw new Error("failed to load parse cookie response src from backend");
		}

		const { data }: ApiResponse<Array<models.GurlKeyValItem>> =
			await res.json();

		if (!data) {
			throw new Error("received invalid parse cookie response from backend");
		}

		return data;
	}

	async sendHttpReq(arg1: models.GurlReq): Promise<models.GurlRes> {
		const res = await fetch(`${this._execBasePath}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(arg1),
		});

		if (!res.ok) {
			throw new Error("failed to execute http req from backend");
		}

		const { data }: ApiResponse<models.GurlRes> = await res.json();

		if (!data) {
			throw new Error(
				"received invalid execute http req response from backend",
			);
		}

		return data;
	}
}
