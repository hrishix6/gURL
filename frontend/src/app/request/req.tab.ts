import { NgClass } from "@angular/common";
import {
	Component,
	computed,
	HostBinding,
	inject,
	input,
	type OnInit,
} from "@angular/core";
import { DraftSavePreferenceModal } from "@/modals/draft.save.preference";
import { SaveReqExampleModal } from "@/modals/save.req.example";
import { RequestFormDetails } from "@/request/req.form.details";
import { ReqFormHeader } from "@/request/req.form.header";
import { ResponseDetails } from "@/response/res.details";
import { AppService, FormService, TabsService } from "@/services";
import { type ApplicationTab, AppTabType, FormLayout } from "@/types";

@Component({
	selector: `gurl-req-tab`,
	template: `
    <gurl-req-form-header
	/>
    <div [ngClass]="layoutClass()">
      <gurl-req-form-details />
      <div class="p-px bg-base-100"></div>
      <gurl-res-details />
    </div>
	@if(
      !appSvc.alwaysDiscardDrafts() && formSvc.isDraftSavePreferenceModalOpen()
    ){
      <dialog gurl-draft-save-preference-modal
	    [title]="formSvc.saveDraftModalTitle()"
		[message]="formSvc.saveDraftModalMessage()"
        [isOpen]="formSvc.isDraftSavePreferenceModalOpen()"
        (onSave)="handleSaveDraft()"
        (onCancel)="handleClose()"
        (onNoSave)="handleNoSaveDraft($event)"
      ></dialog>
    }
	
	@if(formSvc.isSaveExampleModalOpen()) {
	<dialog gurl-req-example-modal
	[actionInProgress]="formSvc.saveExampleInProgress()"
	[isOpen]="formSvc.isSaveExampleModalOpen()"
	(onCancel)="formSvc.handleCloseSaveExampleModal()"
	(onSubmit)="formSvc.saveResponseExample($event)"
	></dialog>		
	}
  `,
	imports: [
		ReqFormHeader,
		RequestFormDetails,
		ResponseDetails,
		NgClass,
		DraftSavePreferenceModal,
		SaveReqExampleModal,
	],
	providers: [FormService],
})
export class RequestTab implements OnInit {
	@HostBinding("class") get defaultClass() {
		if (this.activeId() === this.tab().id) {
			return "flex-1 flex flex-col overflow-hidden";
		}

		return "hidden";
	}

	ngOnInit(): void {
		this.formSvc.initializeReqForm(this.tab().entityId, this.tab().entityType);
	}

	activeId = input.required<string | null>();
	tab = input.required<ApplicationTab>();

	private readonly tabSvc = inject(TabsService);
	protected readonly formSvc = inject(FormService);
	protected readonly appSvc = inject(AppService);

	protected layoutClass = computed(() => {
		const layout = this.appSvc.formLayout();
		const defaults = ["flex-1 overflow-hidden flex"];
		switch (layout) {
			case FormLayout.Horizontal: {
				defaults.push("flex-col");
				break;
			}
			case FormLayout.Vertical: {
				break;
			}
			case FormLayout.Responsive: {
				defaults.push("flex-col xl:flex-row");
				break;
			}
		}
		const cls = defaults.join(" ");
		return cls;
	});

	protected handleSaveDraft() {
		this.formSvc.toggleDraftSavePreferenceModal();
		this.formSvc.toggleSaveRequestModal();
	}

	protected handleClose() {
		this.formSvc.toggleDraftSavePreferenceModal();
	}

	protected handleNoSaveDraft(alwaysDiscard: boolean) {
		this.appSvc.setAlwaysDiscardDrafts(alwaysDiscard);
		this.tabSvc.deleteTab(this.tab().id, AppTabType.Req);
		this.formSvc.toggleDraftSavePreferenceModal();
	}
}
