import { Component, HostBinding, inject, input } from "@angular/core";
import type { models } from "@wailsjs/go/models";
import {
	ArrowDownFromLine,
	ArrowUpFromLine,
	Eraser,
	Eye,
	EyeOff,
	LucideAngularModule,
	Save,
	Timer,
	TriangleAlert,
} from "lucide-angular";
import { BytesPipe } from "@/common/pipes/bytes.pipe";
import { FormService } from "@/services";

@Component({
	selector: `gurl-res-footer`,
	template: `
           <div class="flex-1 flex justify-between items-center">
              <div class="flex items-center">
                    @switch (formSvc.activeResTab()) {
                      @case("res_body"){
                        @if(!formSvc.res()?.limitExceeded){
                          @if(formSvc.res()?.body?.canRender){
                            <label class="label">
                                <input type="checkbox" [checked]="formSvc.previewMode()" (change)="formSvc.togglePreviewMode()" class="toggle toggle-primary" />
                                <span class="text-xs">Preview</span>
                            </label> 
                           }
                        }
                      }
                      @case("res_headers"){
                        @if(formSvc.res()?.resHeaders?.length){
                            <label class="label">
                                <input type="checkbox" [checked]="!formSvc.headersPreviewMode()" (change)="formSvc.toggleHeadersPreview()" class="toggle toggle-primary" />
                                 <span class="text-xs">Raw</span>
                            </label> 
                        }
                      }
                      @case("res_cookies") {
                        @if(formSvc.res()?.cookies?.length){
                          <label class="label">
                                <input type="checkbox" [checked]="!formSvc.cookiesPreviewMode()" (change)="formSvc.toggleCookiePreviewMode()" class="toggle toggle-primary" />
                                <span class="text-xs">Raw</span>
                          </label> 
                        }
                        
                      }
                    }
              </div>
                <section class="flex items-center">
                  <div class="flex gap-1 items-center px-2 py-1 text-xs opacity-60">
                    <lucide-angular [img]="UploadIcon"  class="size-4"/>
                    {{data().uploadSize | bytes}} 
                </div>
                |
                <div class="flex gap-1 items-center px-2 py-1 text-xs opacity-60">
                    <lucide-angular [img]="DownloadSizeIcon"  class="size-4"/>
                    {{data().size | bytes}}
                </div>
                |
                <div class="flex gap-1 items-center px-2 py-1 text-xs opacity-60">
                      <lucide-angular [img]="TimerIcon"  class="size-4"/>
                      TFFB : {{data().ttfbMs}}ms
                </div>
                @if(formSvc.tabType() === "req"){
                <div class="join">
                      @if(formSvc.draftParentData().parentRequestId){
                    <button class="btn btn-sm btn-soft join-item" (click)="formSvc.handleOpenSaveExampleModal()">
                        <lucide-angular [img]="SaveIcon" class="size-4" />
                        Save
                    </button>
                  }
                  <button class="btn btn-sm btn-soft join-item" (click)="formSvc.clearResponse()">
                    <lucide-angular [img]="ClearIcon"  class="size-4"/>
                    Clear
                  </button>
                </div>
              }
              </section>
           </div>
    `,
	imports: [LucideAngularModule, BytesPipe],
})
export class ResFooter {
	@HostBinding("class")
	def = "flex items-center p-2";

	data = input.required<models.GurlRes>();

	protected readonly formSvc = inject(FormService);
	protected readonly UploadIcon = ArrowUpFromLine;
	protected readonly SaveIcon = Save;
	protected readonly ClearIcon = Eraser;
	protected readonly DownloadSizeIcon = ArrowDownFromLine;
	protected readonly AlertIcon = TriangleAlert;
	protected readonly TimerIcon = Timer;
	protected readonly PreviewOpenIcon = Eye;
	protected readonly PreviewCloseIcon = EyeOff;
}
