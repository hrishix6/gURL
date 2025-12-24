import { NgClass } from "@angular/common";
import { Component, HostBinding, inject } from "@angular/core";
import { LucideAngularModule, Save, SendHorizontal } from "lucide-angular";
import { AppDropdown } from "../common/components/dropdown";
import { REQ_METHODS } from "../../constants";
import { FormService } from "../services";
import type { RequestMethod } from "../../types";
import { SaveRequestModal } from "../modals/save.request";

@Component({
	selector: "app-req-form-header",
	template: `
    <div class="flex gap-2.5 p-2 bg-base-300 items-center rounded-box">
      <app-dropdown
        [items]="reqMethods"
        [activeItem]="this.formSvc.method()"
        [size]="'md'"
        [varient]="'ghost'"
        (onItemSelection)="handleActiveItemSelection($event)"
      >
    </app-dropdown>
      <div class="flex-1">
        <input
          type="text"
          [ngClass]="{
            'input w-full': true,
            'input-primary input-ghost': formSvc.isValidUrl() || formSvc.url() === '',
            'input-error': !formSvc.isValidUrl(),
          }"
          placeholder="https://example.com"
          [value]="formSvc.url()"
          (input)="formSvc.setUrl($event.target.value)"
          (blur)="formSvc.parseUrl()"
        />
      </div>
      <div class="flex gap-2.5">
        <button
          class="btn btn-ghost btn-square btn-primary"
          (click)="formSvc.send()"
          [disabled]="formSvc.reqState() === 'progress'"
        >
          <lucide-angular [img]="SendIcon" [size]="24"></lucide-angular>
        </button>
        <button
          class="btn btn-ghost btn-square btn-primary"
          [disabled]="formSvc.reqState() === 'progress'"
          (click)="handleOpenSaveRequestModal()"
        >
          <lucide-angular [img]="SaveIcon" [size]="24"></lucide-angular>
        </button>
      </div>
    </div>
    @if(this.formSvc.isSaveRequestModalOpen()) {
    <dialog saveRequestModal></dialog>
    }
  `,
	imports: [LucideAngularModule, NgClass, AppDropdown, SaveRequestModal],
})
export class ReqFormHeader {
	readonly SendIcon = SendHorizontal;
	readonly SaveIcon = Save;
	readonly reqMethods = REQ_METHODS;

	@HostBinding("class")
	defaultClass = "flex flex-col gap-2 p-2 border-t-1 border-base-100";

	readonly formSvc = inject(FormService);

	handleActiveItemSelection(id: RequestMethod) {
		this.formSvc.setSelectedMethod(id);
	}

	handleOpenSaveRequestModal() {
		this.formSvc.toggleSaveRequestModal();
	}

	handleMethodChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		this.formSvc.setSelectedMethod(target.value as RequestMethod);
	}
}
