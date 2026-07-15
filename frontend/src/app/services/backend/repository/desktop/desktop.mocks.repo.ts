import type { models } from "@wailsjs/go/models";
import {
	CopyMockWithId,
	CreateFreshMockDraft,
	CreateMockDraftFromMock,
	DeleteMockById,
	DeleteMockDraftById,
	GetMockById,
	GetMockDraftById,
	GetMocks,
	SaveMockDraftAsMock,
	UpdateMockDraftFields,
} from "@wailsjs/go/storage/DesktopStorage";
import type { ReqMockRepository } from "@/types";

export class DesktopReqMocksRepo implements ReqMockRepository {
	private static mockInstance: DesktopReqMocksRepo | null = null;
	private constructor() {}

	static getInstance() {
		if (!DesktopReqMocksRepo.mockInstance) {
			DesktopReqMocksRepo.mockInstance = new DesktopReqMocksRepo();
		}

		return DesktopReqMocksRepo.mockInstance;
	}

	createFreshMockDraft(dto: models.AddDraftDTO): Promise<void> {
		return CreateFreshMockDraft(dto);
	}

	getMocks(query: models.MockQueryDTO): Promise<models.MockLightDTO[]> {
		return GetMocks(query);
	}

	deleteMockById(id: string): Promise<void> {
		return DeleteMockById(id);
	}

	getMockDraftById(id: string): Promise<models.MockDraftDTO> {
		return GetMockDraftById(id);
	}
	deleteMockDraftById(id: string): Promise<void> {
		return DeleteMockDraftById(id);
	}
	createMockDraftFromMock(
		mockId: string,
		dto: models.AddDraftDTO,
	): Promise<void> {
		return CreateMockDraftFromMock(mockId, dto);
	}
	updateMockDraftFields(
		id: string,
		dto: models.UpdateMockDraftFields,
	): Promise<void> {
		return UpdateMockDraftFields(id, dto);
	}

	saveMockDraftAsMock(
		draftId: string,
		dto: models.SaveMockDraftAsMock,
	): Promise<models.MockDraftDTO> {
		return SaveMockDraftAsMock(draftId, dto);
	}

	getMockById(id: string): Promise<models.MockLightDTO> {
		return GetMockById(id);
	}

	copyMockWithId(id: string): Promise<models.MockLightDTO> {
		return CopyMockWithId(id);
	}
}
