import { Component, HostBinding, inject, input } from "@angular/core";
import type { models } from "@wailsjs/go/models";
import { SystemIconComponent } from "@/common/components/icon";
import { TooltipDirective } from "@/common/components/tooltip";
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

                @case("res_body") {
                  @if(["json", "xml"].includes(formSvc.res()?.body?.html5Element || "")){
                    <button class="ml-auto btn btn-square btn-sm btn-soft" gurlTooltip [tooltip]="'Format'" (click)="handleTextFormatting()">
                        <i gurl-icon [icon]="'Format'" [className]="'size-4'"></i>
                    </button>
                  }
                }
              
        }
      </div>
    `,
	imports: [ResStats, SystemIconComponent, TooltipDirective],
})
export class ResFooter {
	@HostBinding("class")
	def = "flex items-center px-2 py-1 text-xs";

	data = input.required<models.GurlRes>();

	protected readonly formSvc = inject(FormService);

	handleTextFormatting() {
		this.formSvc.formatResponseText$.next();
	}
}
