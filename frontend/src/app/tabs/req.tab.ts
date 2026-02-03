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
import { RequestFormDetails } from "@/request/req.form.details";
import { ReqFormHeader } from "@/request/req.form.header";
import { ResponseDetails } from "@/response/res.details";
import { AppService, FormService, TabsService } from "@/services";
import { AppTabType, FormLayout } from "@/types";

@Component({
	selector: `gurl-req-tab`,
	template: `
    <gurl-req-form-header />
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
  `,
	imports: [
		ReqFormHeader,
		RequestFormDetails,
		ResponseDetails,
		NgClass,
		DraftSavePreferenceModal,
	],
	providers: [FormService],
})
export class RequestTab implements OnInit {
	@HostBinding("class") get defaultClass() {
		if (this.activeId() === this.tabId()) {
			return "flex-1 flex flex-col overflow-hidden";
		}

		return "hidden";
	}

	ngOnInit(): void {
		console.log(`called`);
		this.formSvc.initializeReqForm(this.draftId());
	}

	activeId = input.required<string | null>();
	tabId = input.required<string>();
	draftId = input.required<string>();

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
		this.tabSvc.deleteTab(this.tabId(), AppTabType.Req);
		this.formSvc.toggleDraftSavePreferenceModal();
	}
}
