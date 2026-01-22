import { Component, computed, HostBinding, inject, input } from "@angular/core";
import type { models } from "@wailsjs/go/models";
import {
	ArrowDownFromLine,
	ArrowUpFromLine,
	Eraser,
	Eye,
	EyeOff,
	LucideAngularModule,
	Timer,
	TriangleAlert,
} from "lucide-angular";
import { BytesPipe } from "@/common/pipes/bytes.pipe";
import { FormService } from "@/services";

@Component({
	selector: `div[resFooter]`,
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
                <button class="btn btn-sm btn-soft" (click)="formSvc.clearResponse()">
                  <lucide-angular [img]="ClearIcon"  class="size-4"/>
                  Clear
                </button>
              </section>
           </div>
    `,
	imports: [LucideAngularModule, BytesPipe],
})
export class ResFooter {
	readonly UploadIcon = ArrowUpFromLine;
	readonly ClearIcon = Eraser;
	readonly DownloadSizeIcon = ArrowDownFromLine;
	readonly AlertIcon = TriangleAlert;
	readonly TimerIcon = Timer;
	readonly PreviewOpenIcon = Eye;
	readonly PreviewCloseIcon = EyeOff;

	data = input.required<models.GurlRes>();
	formSvc = inject(FormService);

	ctypeMismatch = computed(() => {
		const body = this.data().body;

		if (body) {
			return body.detectedMimeType !== body.reportedMileType;
		}

		return false;
	});

	@HostBinding("class")
	def = "flex items-center p-2";
}
