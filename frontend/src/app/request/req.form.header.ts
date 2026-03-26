import { Component, HostBinding, inject } from "@angular/core";
import {
	ArrowRight,
	Copy,
	EllipsisVertical,
	LucideAngularModule,
	Save,
	Trash2,
} from "lucide-angular";
import { GurlDropdown } from "@/common/components";
import { GurlHighlightedInput } from "@/common/components/highlighted.input";
import { REQ_METHODS } from "@/constants";
import { SaveRequestModal } from "@/modals/save.request";
import { AppService, FormService } from "@/services";
import type { RequestMethod } from "@/types";

@Component({
	selector: "gurl-req-form-header",
	template: `
    <div class="flex gap-2.5 p-2 bg-base-300 items-center rounded-box">
      <gurl-dropdown
        [items]="reqMethods"
        [activeItem]="this.f.urlSvc.method()"
        [disabled]="f.tabType() === 'req_example'"
        [size]="'md'"
        [varient]="'ghost'"
        (onItemSelection)="handleActiveItemSelection($event)"
      >
    </gurl-dropdown>
      <div class="flex-1">
        <div gurl-highlighted-input
          [disabled]="false"
          [placeHolder]="'https://example.com'"
          [text]="f.urlSvc.url()"
          (onInput)="f.setUrl($event)"
          (onBlur)="f.parseUrl()"
          [readonly]="f.tabType() === 'req_example'"
        >
        </div>
      </div>
      @if(f.tabType() === "req"){
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
           @if(appSvc.collections().length) {
            <li class="my-0.5">
              <a href="#" (click)="handleOpenSaveRequestModal()">
                <lucide-angular [img]="SaveIcon" class="size-4" /> 
                 Save
             </a>
            </li>
           }
            <li class="my-0.5">
              <a href="#" (click)="f.copyRequest()">
                <lucide-angular [img]="CopyIcon" class="size-4"  /> 
                 Copy
             </a>
            </li>
          </ul>
      </div>
      </div>
      }
    </div>
    @if(this.f.isSaveRequestModalOpen()) {
    <dialog gurl-save-request-modal></dialog>
    }

  `,
	imports: [
		LucideAngularModule,
		GurlDropdown,
		SaveRequestModal,
		GurlHighlightedInput,
	],
})
export class ReqFormHeader {
	@HostBinding("class")
	defaultClass = "flex flex-col gap-2 p-2";

	protected readonly SendIcon = ArrowRight;
	protected readonly RequestOptionsIcon = EllipsisVertical;
	protected readonly SaveIcon = Save;
	protected readonly CopyIcon = Copy;
	protected readonly DeleteIcon = Trash2;
	protected readonly reqMethods = REQ_METHODS;
	protected readonly f = inject(FormService);
	protected readonly appSvc = inject(AppService);

	protected handleActiveItemSelection(id: RequestMethod) {
		this.f.setMethod(id);
	}

	protected handleOpenSaveRequestModal() {
		this.f.toggleSaveRequestModal();
	}
}
