import {
	CancelReq,
	GetSavedResponsesSrc,
	ParseCookieRaw,
	SendHttpReq,
} from "@wailsjs/go/executor/Executor";
import type { models } from "@wailsjs/go/models";
import type { HttpExecutor } from "@/types";

export class DesktopHttpExecutor implements HttpExecutor {
	private static destopHttpExec: DesktopHttpExecutor | null = null;

	private constructor() {}

	static getInstance() {
		if (!DesktopHttpExecutor.destopHttpExec) {
			DesktopHttpExecutor.destopHttpExec = new DesktopHttpExecutor();
		}

		return DesktopHttpExecutor.destopHttpExec;
	}

	cancelReq(arg1: string): Promise<void> {
		return CancelReq(arg1);
	}
	getSavedResponsesSrc(arg1: string): Promise<string> {
		return GetSavedResponsesSrc(arg1);
	}
	parseCookieRaw(arg1: string): Promise<Array<models.GurlKeyValItem>> {
		return ParseCookieRaw(arg1);
	}
	sendHttpReq(arg1: models.GurlReq): Promise<models.GurlRes> {
		return SendHttpReq(arg1);
	}
}
