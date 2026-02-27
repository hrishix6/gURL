import type { models } from "@wailsjs/go/models";
import {
	AddCollection,
	ClearCollection,
	DeleteCollection,
	DeleteDraftsUnderCollection,
	GetAllCollections,
	RenameCollection,
} from "@wailsjs/go/storage/Storage";
import type { CollectionRepository } from "@/types";

export class DesktopCollectionRepository implements CollectionRepository {
	private static desktopCollectionRepo: DesktopCollectionRepository | null =
		null;

	private constructor() {}

	static getInstance() {
		if (!DesktopCollectionRepository.desktopCollectionRepo) {
			DesktopCollectionRepository.desktopCollectionRepo =
				new DesktopCollectionRepository();
		}

		return DesktopCollectionRepository.desktopCollectionRepo;
	}

	getAllCollections(): Promise<Array<models.CollectionDTO>> {
		return GetAllCollections();
	}
	addCollection(id: string, name: string): Promise<void> {
		return AddCollection(id, name);
	}
	clearCollection(arg1: string): Promise<void> {
		return ClearCollection(arg1);
	}
	deleteCollection(id: string): Promise<void> {
		return DeleteCollection(id);
	}
	deleteDraftsUnderCollection(id: string): Promise<void> {
		return DeleteDraftsUnderCollection(id);
	}
	renameCollection(arg1: string, arg2: string): Promise<void> {
		return RenameCollection(arg1, arg2);
	}
}
