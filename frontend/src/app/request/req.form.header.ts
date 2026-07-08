import { Component, HostBinding, inject } from "@angular/core";
import { GurlDropdown } from "@/common/components";
import { GurlHighlightedInput } from "@/common/components/highlighted.input";
import { SystemIconComponent } from "@/common/components/icon";
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
            [activeEnvSub]="appSvc.activeEnvChange$"
            [extractTokensFn]="f.reqFormExtractTokensCB"
            [disabled]="false"
            [placeHolder]="'https://example.com'"
            [text]="f.urlSvc.url()"
            (onInput)="f.setUrl($event)"
            (onBlur)="f.parseUrl()"
            [readonly]="f.tabType() === 'req_example'"
          >
          </div>
      </div>
      @if(f.tabType() === 'req'){
      <div class="flex gap-2.5">
        <button
          class="btn btn-soft btn-primary"
          (click)="f.send()"
          [disabled]="f.reqState() === 'progress'"
        >
          <i gurl-icon [icon]="'Send'" [className]="'size-6'" ></i>
        </button>
        <div class="dropdown dropdown-end">
          <div tabindex="0" role="button" class="btn btn-square btn-ghost">
            <i gurl-icon [icon]="'Options'" [className]="'size-6'" ></i>
          </div>
            <ul
              tabindex="-1"
              class="dropdown-content menu bg-base-100 rounded-box z-50 w-36 shadow-sm"
            > 
            @if(appSvc.collections().length) {
              <li class="my-0.5">
                <button role="link" (click)="handleOpenSaveRequestModal()">
                  <i gurl-icon [icon]="'Save'" [className]="'size-4'" ></i>
                  Save
                </button>
              </li>
            }
              <li class="my-0.5">
                  <button role="link" (click)="f.copyRequest()">
                    <i gurl-icon [icon]="'Copy'" [className]="'size-4'" ></i>
                    Copy
                  </button>
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
		GurlDropdown,
		SaveRequestModal,
		GurlHighlightedInput,
		SystemIconComponent,
	],
})
export class ReqFormHeader {
	@HostBinding("class")
	defaultClass = "flex flex-col gap-2 p-2";

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
