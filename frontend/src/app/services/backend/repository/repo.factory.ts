import { getAppConfig } from "@/app.config";
import type {
	CollectionRepository,
	EnvironmentRepository,
	FileRepository,
	RequestRepository,
	UIStateRepository,
	WorkspaceRepository,
} from "@/types";
import { DesktopCollectionRepository } from "./desktop/desktop.collection.repo";
import { DesktopEnvRepository } from "./desktop/desktop.env.repo";
import { DesktopFileRepository } from "./desktop/desktop.file.repo";
import { DesktopReqRepository } from "./desktop/desktop.req.repo";
import { DesktopUIStateRepository } from "./desktop/desktop.ui.repo";
import { DesktopWorkspaceRepository } from "./desktop/desktop.workspace.repo";
import { WebCollectionRepository } from "./web/web.collection.repo";
import { WebEnvRepository } from "./web/web.env.repo";
import { WebFileRepository } from "./web/web.file.repo";
import { WebReqRepository } from "./web/web.req.repo";
import { WebUIStateRepository } from "./web/web.ui.repo";
import { WebWorkspaceRepository } from "./web/web.workspace.repo";

export function getUIStateRepository(): UIStateRepository {
	const { mode } = getAppConfig();
	switch (mode) {
		case "desktop":
			return DesktopUIStateRepository.getInstance();

		case "web":
			return WebUIStateRepository.getInstance();

		default:
			throw new Error("Unsupported mode");
	}
}

export function getWorkspaceRepository(): WorkspaceRepository {
	const { mode } = getAppConfig();
	switch (mode) {
		case "desktop":
			return DesktopWorkspaceRepository.getInstance();
		case "web":
			return WebWorkspaceRepository.getInstance();
		default:
			throw new Error("Unsupported mode");
	}
}

export function getCollectionRepository(): CollectionRepository {
	const { mode } = getAppConfig();
	switch (mode) {
		case "desktop":
			return DesktopCollectionRepository.getInstance();
		case "web":
			return WebCollectionRepository.getInstance();
		default:
			throw new Error("Unsupported mode");
	}
}

export function getEnvRepository(): EnvironmentRepository {
	const { mode } = getAppConfig();
	switch (mode) {
		case "desktop":
			return DesktopEnvRepository.getInstance();
		case "web":
			return WebEnvRepository.getInstance();
		default:
			throw new Error("Unsupported mode");
	}
}

export function getReqRepository(): RequestRepository {
	const { mode } = getAppConfig();
	switch (mode) {
		case "desktop":
			return DesktopReqRepository.getInstance();
		case "web":
			return WebReqRepository.getInstance();
		default:
			throw new Error("Unsupported mode");
	}
}

export function getFileRepository(): FileRepository {
	const { mode } = getAppConfig();
	switch (mode) {
		case "desktop":
			return DesktopFileRepository.getInstance();
		case "web":
			return WebFileRepository.getInstance();
		default:
			throw new Error("Unsupported mode");
	}
}
