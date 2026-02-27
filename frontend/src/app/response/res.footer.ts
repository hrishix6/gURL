import { Component, HostBinding, inject, input } from "@angular/core";
import type { models } from "@wailsjs/go/models";
import {
	ArrowDownFromLine,
	ArrowUpFromLine,
	Eye,
	EyeOff,
	LucideAngularModule,
	Timer,
	TriangleAlert,
} from "lucide-angular";
import { FormService } from "@/services";
import { ResStats } from "./res.stats";

@Component({
	selector: `gurl-res-footer`,
	template: `
      <div class="flex-1 flex justify-between items-center">
        <gurl-res-stats [data]="formSvc.res()!" /> 
        @switch (formSvc.activeResTab()) {
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
    `,
	imports: [LucideAngularModule, ResStats],
})
export class ResFooter {
	@HostBinding("class")
	def = "flex items-center px-2 py-1 text-xs";

	data = input.required<models.GurlRes>();

	protected readonly formSvc = inject(FormService);
	protected readonly UploadIcon = ArrowUpFromLine;
	protected readonly DownloadSizeIcon = ArrowDownFromLine;
	protected readonly AlertIcon = TriangleAlert;
	protected readonly TimerIcon = Timer;
	protected readonly PreviewOpenIcon = Eye;
	protected readonly PreviewCloseIcon = EyeOff;
}
