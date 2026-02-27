import type { HttpExecutor } from "@/types";
import { getMode } from "../mode";
import { DesktopHttpExecutor } from "./desktop.exec";

export function getHttpExecutor(): HttpExecutor {
	switch (getMode()) {
		case "desktop":
			return DesktopHttpExecutor.getInstance();
		default:
			throw new Error("Unsupported mode");
	}
}
