import { Component, HostBinding, inject } from "@angular/core";
import { Eye, EyeOff, LucideAngularModule } from "lucide-angular";
import { AppDropdown } from "@/common/components";
import { REQ_BODY_TYPES } from "@/constants";
import { FormService } from "@/services";
import type { ReqBodyType, ReqTabId } from "@/types";

@Component({
	selector: `app-req-footer`,
	template: `
        @switch (formSvc.activeReqTab()) {
            @case ("req_headers") {
                 <label class="label">
                            <input type="checkbox" [checked]="formSvc.bulkEditModeHeaders()" (change)="handleEditModeSwitch('req_headers')" class="toggle" />
                             Raw
                    </label>
            }
            @case ('req_query'){
                    <label class="label">
                            <input type="checkbox" [checked]="formSvc.bulkEditModeQuery()" (change)="handleEditModeSwitch('req_query')" class="toggle" />
                             Raw
                    </label>
            }
            @case('req_cookies'){
                    <label class="label">
                            <input type="checkbox" [checked]="formSvc.bulkEditModeCookies()" (change)="handleEditModeSwitch('req_cookies')" class="toggle" />
                             Raw
                    </label>
            }
            @case('req_body'){
                <div class="flex gap-4 items-center">
                    @if(["urlencoded"].includes(formSvc.bodyType().id)){
                        <label class="label">
                            <input type="checkbox" [checked]="formSvc.bulkEditModeUrlEncodedForm()" (change)="handleEditModeSwitch('req_body')" class="toggle" />
                             Raw
                        </label>
                }
                <app-dropdown
                            [items]="reqBodyTypes"
                            [activeItem]="formSvc.bodyType()"
                            [direction]="'top'"
                            [align]="'start'" 
                            [size]="'sm'"
                            [varient]="'soft'"
                            [primary]="false"
                            (onItemSelection)="handleActiveItemSelection($event)"
                            >
                </app-dropdown>
            </div>
        }
    }
    `,
	imports: [LucideAngularModule, AppDropdown],
})
export class ReqFooter {
	readonly PreviewOpenIcon = Eye;
	readonly PreviewCloseIcon = EyeOff;

	readonly formSvc = inject(FormService);
	readonly reqBodyTypes = REQ_BODY_TYPES;

	@HostBinding("class")
	def = "flex text-xs px-2 py-1";

	handleActiveItemSelection(id: ReqBodyType) {
		this.formSvc.setBodyType(id);
	}

	handleEditModeSwitch(tabId: ReqTabId) {
		switch (tabId) {
			case "req_headers": {
				return this.formSvc.toggleEditModeHeaders();
			}
			case "req_query": {
				return this.formSvc.toggleEditModeQuery();
			}
			case "req_body": {
				return this.formSvc.toggleEditModeUrlEncodedForm();
			}
			case "req_cookies": {
				return this.formSvc.toggleEditModeCookies();
			}
		}
	}
}
