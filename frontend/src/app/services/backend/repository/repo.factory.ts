import type {
	CollectionRepository,
	EnvironmentRepository,
	FileRepository,
	RequestRepository,
	UIStateRepository,
} from "@/types";
import { getMode } from "../mode";
import { DesktopCollectionRepository } from "./desktop/desktop.collection.repo";
import { DesktopEnvRepository } from "./desktop/desktop.env.repo";
import { DesktopFileRepository } from "./desktop/desktop.file.repo";
import { DesktopReqRepository } from "./desktop/desktop.req.repo";
import { DesktopUIStateRepository } from "./desktop/desktop.ui.repo";

export function getCollectionRepository(): CollectionRepository {
	switch (getMode()) {
		case "desktop":
			return DesktopCollectionRepository.getInstance();
		default:
			throw new Error("Unsupported mode");
	}
}

export function getReqRepository(): RequestRepository {
	switch (getMode()) {
		case "desktop":
			return DesktopReqRepository.getInstance();

		default:
			throw new Error("Unsupported mode");
	}
}

export function getEnvRepository(): EnvironmentRepository {
	switch (getMode()) {
		case "desktop":
			return DesktopEnvRepository.getInstance();

		default:
			throw new Error("Unsupported mode");
	}
}

export function getUIStateRepository(): UIStateRepository {
	switch (getMode()) {
		case "desktop":
			return DesktopUIStateRepository.getInstance();

		default:
			throw new Error("Unsupported mode");
	}
}

export function getFileRepository(): FileRepository {
	switch (getMode()) {
		case "desktop":
			return DesktopFileRepository.getInstance();

		default:
			throw new Error("Unsupported mode");
	}
}
