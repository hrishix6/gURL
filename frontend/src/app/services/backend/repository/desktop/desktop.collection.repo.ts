import type { models } from "@wailsjs/go/models";
import {
	AddCollection,
	ClearCollection,
	CreateAndStartMockServer,
	DeleteCollection,
	GetAllCollections,
	GetCollectionById,
	RenameCollection,
	UpdateMockServer,
} from "@wailsjs/go/storage/DesktopStorage";
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

	getCollectionById(
		id: string,
	): Promise<models.CollectionDTO | undefined | null> {
		return GetCollectionById(id);
	}

	getAllCollections(
		q: models.CollectionsQueryDTO,
	): Promise<Array<models.CollectionDTO>> {
		return GetAllCollections(q);
	}

	addCollection(dto: models.CreateCollectionDTO): Promise<void> {
		return AddCollection(dto);
	}
	clearCollection(arg1: string): Promise<void> {
		return ClearCollection(arg1);
	}
	deleteCollection(id: string): Promise<void> {
		return DeleteCollection(id);
	}
	renameCollection(arg1: string, arg2: string): Promise<void> {
		return RenameCollection(arg1, arg2);
	}

	createMockServer(
		query: models.CreateMockServerDTO,
	): Promise<models.CollectionDTO> {
		return CreateAndStartMockServer(query);
	}
	updateMockServer(id: string, flag: boolean): Promise<models.CollectionDTO> {
		return UpdateMockServer(id, flag);
	}
}
