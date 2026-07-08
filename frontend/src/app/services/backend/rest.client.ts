import { getAppConfig } from "@/app.config";
import type { ApiResponse, UserInfo } from "@/types";

export class RestClient {
	private readonly apiBaseURL: string;
	private readonly authBaseURL: string;
	private static restClient: RestClient;
	private readonly timeoutMS: number;
	private readonly fileDlTimeoutMS: number;
	private readonly fileULTimeoutMS: number;

	private constructor() {
		({ api_url: this.apiBaseURL, auth_url: this.authBaseURL } = getAppConfig());
		this.timeoutMS = 2500;
		this.fileDlTimeoutMS = 30000;
		this.fileULTimeoutMS = 10000;
	}

	static getInstance() {
		if (!RestClient.restClient) {
			RestClient.restClient = new RestClient();
		}

		return RestClient.restClient;
	}

	async checkIfLoggedIn(): Promise<ApiResponse<UserInfo>> {
		const response = await fetch(`${this.authBaseURL}/check`, {
			signal: AbortSignal.timeout(this.timeoutMS),
		});

		const json: ApiResponse<UserInfo> = await response.json();
		return json;
	}

	async get<T>(path: string, query?: URLSearchParams, ignoreTimeout = false) {
		return this.getOrDelete<T>("GET", path, query, ignoreTimeout);
	}

	private async getOrDelete<T>(
		method: "GET" | "DELETE",
		path: string,
		query?: URLSearchParams,
		ignoreTimeout = false,
	): Promise<ApiResponse<T>> {
		const response = await fetch(
			`${this.apiBaseURL}/${path}${query ? `?${query.toString()}` : ""}`,
			{
				method,
				credentials: "include",
				...(ignoreTimeout
					? {}
					: { signal: AbortSignal.timeout(this.timeoutMS) }),
			},
		);

		const json: ApiResponse<T> = await response.json();
		return json;
	}

	private async postOrPutOrPatch<T>(
		method: "POST" | "PUT" | "PATCH",
		path: string,
		body: any,
		query?: URLSearchParams,
		ignoreTimeout = false,
	): Promise<ApiResponse<T>> {
		const response = await fetch(
			`${this.apiBaseURL}/${path}${query ? `?${query.toString()}` : ""}`,
			{
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
				credentials: "include",
				...(ignoreTimeout
					? {}
					: { signal: AbortSignal.timeout(this.timeoutMS) }),
			},
		);

		const json = await response.json();
		return json;
	}

	async post<T>(
		path: string,
		body: any,
		query?: URLSearchParams,
		ignoreTimeout = false,
	) {
		return this.postOrPutOrPatch<T>("POST", path, body, query, ignoreTimeout);
	}

	async patch<T>(
		path: string,
		body: any,
		query?: URLSearchParams,
		ignoreTimeout = false,
	) {
		return this.postOrPutOrPatch<T>("PATCH", path, body, query, ignoreTimeout);
	}

	async put<T>(
		path: string,
		body: any,
		query?: URLSearchParams,
		ignoreTimeout = false,
	) {
		return this.postOrPutOrPatch<T>("PUT", path, body, query, ignoreTimeout);
	}

	async delete<T>(
		path: string,
		query?: URLSearchParams,
		ignoreTimeout = false,
	) {
		return this.getOrDelete<T>("DELETE", path, query, ignoreTimeout);
	}

	async authPost<T>(
		path: string,
		body: any,
		query?: URLSearchParams,
	): Promise<ApiResponse<T>> {
		const response = await fetch(
			`${this.authBaseURL}/${path}${query ? `?${query.toString()}` : ""}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
				signal: AbortSignal.timeout(this.timeoutMS),
			},
		);

		const json: ApiResponse<T> = await response.json();
		return json;
	}

	async uploadFile<T>(
		path: string,
		file: File,
		query?: URLSearchParams,
		ignoreTimeout = false,
	): Promise<ApiResponse<T>> {
		const res = await fetch(
			`${this.apiBaseURL}/${path}${query ? `?${query.toString()}` : ""}`,
			{
				method: "PUT",
				body: file,
				credentials: "include",
				...(ignoreTimeout
					? {}
					: { signal: AbortSignal.timeout(this.fileULTimeoutMS) }),
			},
		);

		const json: ApiResponse<T> = await res.json();
		return json;
	}

	async downloadFile(
		path: string,
		query?: URLSearchParams,
		ignoreTimeout = false,
	): Promise<Blob> {
		const res = await fetch(
			`${this.apiBaseURL}/${path}${query ? `?${query.toString()}` : ""}`,
			{
				credentials: "include",
				...(ignoreTimeout
					? {}
					: { signal: AbortSignal.timeout(this.fileDlTimeoutMS) }),
			},
		);

		if (!res.ok) {
			throw new Error(`got failure response code from backend ${res.status}`);
		}

		return res.blob();
	}

	async downloadFilePost(
		path: string,
		body: any,
		query?: URLSearchParams,
		ignoreTimeout = false,
	): Promise<Blob> {
		const res = await fetch(
			`${this.apiBaseURL}/${path}${query ? `?${query.toString()}` : ""}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
				credentials: "include",
				...(ignoreTimeout
					? {}
					: { signal: AbortSignal.timeout(this.fileDlTimeoutMS) }),
			},
		);

		if (!res.ok) {
			throw new Error("Unable to download file");
		}

		return res.blob();
	}
}
