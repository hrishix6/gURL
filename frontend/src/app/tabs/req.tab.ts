import { NgClass } from "@angular/common";
import {
	Component,
	computed,
	HostBinding,
	inject,
	input,
	signal,
	type OnInit,
} from "@angular/core";
import { RequestFormDetails } from "@/request/req.form.details";
import { ReqFormHeader } from "@/request/req.form.header";
import { ResponseDetails } from "@/response/res.details";
import { AppService, FormService, TabsService } from "@/services";
import { FormLayout } from "@/types";
import { DraftSavePreferenceModal } from "@/modals/draft.save.preference";

@Component({
	selector: `app-request-tab`,
	template: `
    <app-req-form-header></app-req-form-header>
    <div [ngClass]="layoutClass()">
      <app-req-form-details></app-req-form-details>
      <div class="p-px bg-base-100"></div>
      <app-res-details></app-res-details>
    </div>
	@if(
      !appSvc.alwaysDiscardDrafts() && formSvc.isDraftSavePreferenceModalOpen()
    ){
      <dialog draftSavePreferenceModal
	    [title]="formSvc.saveDraftModalTitle()"
		[message]="formSvc.saveDraftModalMessage()"
        [isOpen]="formSvc.isDraftSavePreferenceModalOpen()"
        (onSave)="handleSaveDraft()"
        (onCancel)="handleClose()"
        (onNoSave)="handleNoSaveDraft($event)"
      ></dialog>
    }
  `,
	imports: [ReqFormHeader, RequestFormDetails, ResponseDetails, NgClass, DraftSavePreferenceModal],
	providers: [FormService],
})
export class RequestTab implements OnInit {
	activeId = input.required<string | null>();
	tabId = input.required<string>();
	draftId = input.required<string>();
	tabSvc = inject(TabsService);

	layoutClass = computed(() => {
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
		console.log(`layout class - ${cls}`);
		return cls;
	});

	formSvc = inject(FormService);
	appSvc = inject(AppService);

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

  handleSaveDraft() {
	this.formSvc.toggleDraftSavePreferenceModal();
     this.formSvc.toggleSaveRequestModal();
  }

  handleClose() {
    this.formSvc.toggleDraftSavePreferenceModal();
  }

  handleNoSaveDraft(alwaysDiscard: boolean) {
	this.appSvc.setAlwaysDiscardDrafts(alwaysDiscard);
    this.tabSvc.deleteTab(this.tabId());
    this.formSvc.toggleDraftSavePreferenceModal();
  }
}
