import { NgClass } from "@angular/common";
import {
	Component,
	HostBinding,
	inject,
	input,
	type OnInit,
} from "@angular/core";
import { AppService, FormService } from "../services";
import { RequestFormDetails } from "../request/req.form.details";
import { ReqFormHeader } from "../request/req.form.header";
import { ResponseDetails } from "../response/res.details";

@Component({
	selector: `app-request-tab`,
	template: `
    <app-req-form-header></app-req-form-header>
    <div
      [ngClass]="{
        'flex-1 flex gap-2 overflow-hidden': true,
        'flex-col': appSvc.formLayout() === 'h',
        'flex-row': appSvc.formLayout() === 'v'
      }"
    >
      <app-req-form-details></app-req-form-details>
      <div class="p-px bg-base-100"></div>
      <app-res-details></app-res-details>
    </div>
  `,
	imports: [ReqFormHeader, RequestFormDetails, ResponseDetails, NgClass],
	providers: [FormService],
})
export class RequestTab implements OnInit {
	activeId = input.required<string | null>();
	tabId = input.required<string>();
	draftId = input.required<string>();

	formSvc = inject(FormService);
	appSvc = inject(AppService);

	@HostBinding("class") get defaultClass() {
		if (this.activeId() === this.tabId()) {
			return "flex-1 flex flex-col gap-2 overflow-hidden";
		}

		return "hidden";
	}

	ngOnInit(): void {
		this.formSvc.initializeReqForm(this.draftId());
	}
}
