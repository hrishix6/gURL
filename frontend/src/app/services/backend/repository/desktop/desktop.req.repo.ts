import type { models } from "@wailsjs/go/models";
import {
	AddDraft,
	AddDraftFromRequest,
	AddFreshDraft,
	AddReqExample,
	CreateMockFromExample,
	DeleteReqExample,
	DeleteSavedReq,
	FindDraftById,
	GetReqExampleById,
	GetReqExamples,
	GetSavedRequestById,
	GetSavedRequests,
	RemoveDraft,
	SaveDraftAsRequest,
	SaveRequestCopy,
	UpdateDraftFields,
} from "@wailsjs/go/storage/DesktopStorage";
import type { RequestRepository } from "@/types";

export class DesktopReqRepository implements RequestRepository {
	private static desktopReqRepo: DesktopReqRepository | null = null;

	private constructor() {}

	static getInstance() {
		if (!DesktopReqRepository.desktopReqRepo) {
			DesktopReqRepository.desktopReqRepo = new DesktopReqRepository();
		}

		return DesktopReqRepository.desktopReqRepo;
	}

	getSavedReqById(id: string): Promise<models.RequestLightDTO | undefined> {
		return GetSavedRequestById(id);
	}

	addDraft(arg1: models.RequestDraftDTO): Promise<void> {
		return AddDraft(arg1);
	}
	addDraftFromRequest(id: string, arg1: models.AddDraftDTO): Promise<void> {
		return AddDraftFromRequest(id, arg1);
	}
	addFreshDraft(arg1: models.AddDraftDTO): Promise<void> {
		return AddFreshDraft(arg1);
	}
	removeDraft(arg1: string): Promise<void> {
		return RemoveDraft(arg1);
	}
	addReqExample(
		arg1: models.ReqExampleDTO,
		arg2: models.SavedResponseRenderMeta,
	): Promise<void> {
		return AddReqExample(arg1, arg2);
	}
	deleteReqExample(arg1: string): Promise<void> {
		return DeleteReqExample(arg1);
	}

	deleteSavedReq(arg1: string): Promise<void> {
		return DeleteSavedReq(arg1);
	}
	findDraftById(arg1: string): Promise<models.RequestDraftDTO> {
		return FindDraftById(arg1);
	}

	getReqExampleById(arg1: string): Promise<models.ReqExampleDTO> {
		return GetReqExampleById(arg1);
	}

	getReqExamples(
		q: models.ReqExampleQueryDTO,
	): Promise<Array<models.ReqExampleLightDTO>> {
		return GetReqExamples(q);
	}
	getSavedRequests(
		q: models.ReqQueryDTO,
	): Promise<Array<models.RequestLightDTO>> {
		return GetSavedRequests(q);
	}

	saveDraftAsRequest(
		draftId: string,
		arg1: models.SaveDraftAsReqDTO,
	): Promise<models.RequestDraftDTO> {
		return SaveDraftAsRequest(draftId, arg1);
	}
	saveRequestCopy(
		sourceId: string,
		arg1: models.SaveRequestCopyDTO,
	): Promise<string> {
		return SaveRequestCopy(sourceId, arg1);
	}
	updatereqDraftFields(
		draftId: string,
		arg: models.UpdateDraftFieldsDTO,
	): Promise<void> {
		return UpdateDraftFields(draftId, arg);
	}

	createMockFromExample(
		exampleId: string,
		dto: models.CreateMockDTO,
	): Promise<models.MockLightDTO> {
		return CreateMockFromExample(exampleId, dto);
	}
}
