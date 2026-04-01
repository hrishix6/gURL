import { getAppConfig } from "@/app.config";
import type { ApiResponse } from "@/types";

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

	async get<T>(path: string, query?: URLSearchParams): Promise<T | undefined> {
		return this.getOrDelete("GET", path, query);
	}

	private async getOrDelete<T>(
		method: "GET" | "DELETE",
		path: string,
		query?: URLSearchParams,
	): Promise<T | undefined> {
		const response = await fetch(
			`${this.apiBaseURL}/${path}${query ? `?${query.toString()}` : ""}`,
			{
				method,
				signal: AbortSignal.timeout(this.timeoutMS),
				credentials: "same-origin",
			},
		);

		if (!response.ok) {
			throw new Error(
				`received failure status from backend: ${response.status}`,
			);
		}

		const { data }: ApiResponse<T> = await response.json();
		return data;
	}

	private async postOrPutOrPatch<T>(
		method: "POST" | "PUT" | "PATCH",
		path: string,
		body: any,
		query?: URLSearchParams,
	): Promise<T | undefined> {
		const response = await fetch(
			`${this.apiBaseURL}/${path}${query ? `?${query.toString()}` : ""}`,
			{
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
				signal: AbortSignal.timeout(this.timeoutMS),
				credentials: "same-origin",
			},
		);

		if (!response.ok) {
			throw new Error(
				`received failure status from backend: ${response.status}`,
			);
		}

		const { data }: ApiResponse<T> = await response.json();
		return data;
	}

	async post<T>(
		path: string,
		body: any,
		query?: URLSearchParams,
	): Promise<T | undefined> {
		return this.postOrPutOrPatch("POST", path, body, query);
	}

	async patch<T>(
		path: string,
		body: any,
		query?: URLSearchParams,
	): Promise<T | undefined> {
		return this.postOrPutOrPatch("PATCH", path, body, query);
	}

	async put<T>(
		path: string,
		body: any,
		query?: URLSearchParams,
	): Promise<T | undefined> {
		return this.postOrPutOrPatch("PUT", path, body, query);
	}

	async delete<T>(
		path: string,
		query?: URLSearchParams,
	): Promise<T | undefined> {
		return this.getOrDelete("DELETE", path, query);
	}

	async authPost<T>(
		path: string,
		body: any,
		query?: URLSearchParams,
	): Promise<T | undefined> {
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

		if (!response.ok) {
			throw new Error(
				`received failure status from backend: ${response.status}`,
			);
		}

		const { data }: ApiResponse<T> = await response.json();
		return data;
	}

	async uploadFile<T>(
		path: string,
		file: File,
		query?: URLSearchParams,
	): Promise<T> {
		const res = await fetch(
			`${this.apiBaseURL}/${path}${query ? `?${query.toString()}` : ""}`,
			{
				method: "PUT",
				body: file,
				signal: AbortSignal.timeout(this.fileULTimeoutMS),
				credentials: "same-origin",
			},
		);

		if (!res.ok) {
			throw new Error("Unable to upload tmp file");
		}

		const { data }: ApiResponse<T> = await res.json();

		if (!data) {
			throw new Error("Unable to receive upload metadata");
		}

		return data;
	}

	async downloadFile(path: string, query?: URLSearchParams): Promise<Blob> {
		const res = await fetch(
			`${this.apiBaseURL}/${path}${query ? `?${query.toString()}` : ""}`,
			{
				signal: AbortSignal.timeout(this.fileDlTimeoutMS),
				credentials: "same-origin",
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
	): Promise<Blob> {
		const res = await fetch(
			`${this.apiBaseURL}/${path}${query ? `?${query.toString()}` : ""}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(body),
				signal: AbortSignal.timeout(this.fileDlTimeoutMS),
				credentials: "same-origin",
			},
		);

		if (!res.ok) {
			throw new Error("Unable to download file");
		}

		return res.blob();
	}
}
