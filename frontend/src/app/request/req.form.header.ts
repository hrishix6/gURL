import { NgClass } from "@angular/common";
import { Component, HostBinding, inject } from "@angular/core";
import {
	ArrowRight,
	Copy,
	EllipsisVertical,
	LucideAngularModule,
	Save,
	Trash2,
} from "lucide-angular";
import { AppDropdown } from "@/common/components";
import { REQ_METHODS } from "@/constants";
import { SaveRequestModal } from "@/modals/save.request";
import { FormService } from "@/services";
import type { RequestMethod } from "@/types";

@Component({
	selector: "app-req-form-header",
	template: `
    <div class="flex gap-2.5 p-2 bg-base-300 items-center rounded-box">
      <app-dropdown
        [items]="reqMethods"
        [activeItem]="this.f.urlSvc.method()"
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
            'input-primary input-ghost': f.urlSvc.isValidUrl() || f.urlSvc.url() === '',
            'input-error': !f.urlSvc.isValidUrl(),
          }"
          placeholder="https://example.com"
          [value]="f.urlSvc.url()"
          (input)="f.setUrl($event.target.value)"
          (blur)="f.parseUrl()"
        />
      </div>
      <div class="flex gap-2.5">
        <button
          class="btn btn-soft btn-primary"
          (click)="f.send()"
          [disabled]="f.reqState() === 'progress'"
        >
          <lucide-angular [img]="SendIcon" class="size-6"></lucide-angular>
        </button>
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-square btn-ghost">
            <lucide-angular [img]="RequestOptionsIcon" class="size-6" />
          </div>
          <ul
            tabindex="-1"
            class="dropdown-content menu bg-base-100 rounded-box z-50 w-36 shadow-sm"
          > 
            <li class="my-0.5">
              <a href="#" (click)="handleOpenSaveRequestModal()">
                <lucide-angular [img]="SaveIcon" class="size-4" /> 
                 Save
             </a>
            </li>
            <li class="my-0.5">
              <a href="#" (click)="f.copyRequest()">
                <lucide-angular [img]="CopyIcon" class="size-4"  /> 
                 Copy
             </a>
            </li>
          </ul>
      </div>
      </div>
    </div>
    @if(this.f.isSaveRequestModalOpen()) {
    <dialog saveRequestModal></dialog>
    }

  `,
	imports: [LucideAngularModule, NgClass, AppDropdown, SaveRequestModal],
})
export class ReqFormHeader {
	readonly SendIcon = ArrowRight;
	readonly RequestOptionsIcon = EllipsisVertical;
	readonly SaveIcon = Save;
	readonly CopyIcon = Copy;
	readonly DeleteIcon = Trash2;
	readonly reqMethods = REQ_METHODS;

	@HostBinding("class")
	defaultClass = "flex flex-col gap-2 p-2 border-t-2 border-base-100";

	readonly f = inject(FormService);

	handleActiveItemSelection(id: RequestMethod) {
		this.f.setMethod(id);
	}

	handleOpenSaveRequestModal() {
		this.f.toggleSaveRequestModal();
	}
}
