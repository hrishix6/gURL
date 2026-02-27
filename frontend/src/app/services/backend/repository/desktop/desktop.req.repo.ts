import type { models } from "@wailsjs/go/models";
import {
	AddDraft,
	AddDraftFromRequest,
	AddFreshDraft,
	AddReqExample,
	DeleteReqExample,
	DeleteRequestDrafts,
	DeleteSavedReq,
	FindDraftById,
	FindDraftIdsByCollection,
	FindEnvDraft,
	GetReqExampleById,
	GetReqExamples,
	GetSavedRequests,
	RemoveDraft,
	SaveDraftAsRequest,
	SaveRequestCopy,
	UpdateDraftFields,
} from "@wailsjs/go/storage/Storage";
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

	addDraft(arg1: models.RequestDraftDTO): Promise<void> {
		return AddDraft(arg1);
	}
	addDraftFromRequest(arg1: models.AddDraftFromRequestDTO): Promise<void> {
		return AddDraftFromRequest(arg1);
	}
	addFreshDraft(arg1: models.AddFreshDraftDTO): Promise<void> {
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
	deleteRequestDrafts(arg1: string): Promise<void> {
		return DeleteRequestDrafts(arg1);
	}
	deleteSavedReq(arg1: string): Promise<void> {
		return DeleteSavedReq(arg1);
	}
	findDraftById(arg1: string): Promise<models.RequestDraftDTO> {
		return FindDraftById(arg1);
	}
	findDraftIdsByCollection(arg1: string): Promise<Array<string>> {
		return FindDraftIdsByCollection(arg1);
	}
	findEnvDraft(arg1: string): Promise<models.EnvironmentDraftDTO> {
		return FindEnvDraft(arg1);
	}
	getReqExampleById(arg1: string): Promise<models.ReqExampleDTO> {
		return GetReqExampleById(arg1);
	}
	getReqExamples(): Promise<Array<models.ReqExampleLightDTO>> {
		return GetReqExamples();
	}
	getSavedRequests(): Promise<Array<models.RequestLightDTO>> {
		return GetSavedRequests();
	}
	saveDraftAsRequest(arg1: models.SaveDraftAsReqDTO): Promise<void> {
		return SaveDraftAsRequest(arg1);
	}
	saveRequestCopy(arg1: models.SaveRequestCopyDTO): Promise<void> {
		return SaveRequestCopy(arg1);
	}
	updatereqDraftFields(arg: models.UpdateDraftFieldsDTO): Promise<void> {
		return UpdateDraftFields(arg);
	}
}
