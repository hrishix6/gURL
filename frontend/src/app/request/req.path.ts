import { Component, inject } from "@angular/core";
import { GurlHighlightedInput } from "@/common/components/highlighted.input";
import { SystemIconComponent } from "@/common/components/icon";
import { AppService, FormService } from "@/services";

@Component({
	selector: "gurl-req-path",
	template: `
  <div class="flex-1 overflow-y-auto p-1 relative">
         @if(f.urlSvc.pathParams().length === 0){
            <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
                <i gurl-icon [icon]="'Empty'" [className]="'size-16 -z-10'" ></i>
            </div>
         }
         @else {
            <div class="flex flex-col gap-2.5">
                @for(item of f.urlSvc.pathParams(); track item.id){
                    <div class="flex items-center gap-2.5">
                        <div
                            gurl-highlighted-input
                            [placeHolder]="'key'"
                            [readonly]="true"
                            [disabled]="false"
                            [text]="item.key"
                            [extractTokensFn]="f.reqFormExtractTokensCB"
                            [activeEnvSub]="appSvc.activeEnvChange$"
                        >
                        </div>
                        <div class="flex-2">
                            <div
                            gurl-highlighted-input
                            [placeHolder]="'value'"
                            [disabled]="false"
                            [text]="item.val"
                            (onInput)="f.updatePathParam(item.id, 'val', $event)"
                            [readonly]="false"
                            [extractTokensFn]="f.reqFormExtractTokensCB"
                            [activeEnvSub]="appSvc.activeEnvChange$"
                            >
                            </div>
                        </div>
                    </div>
               }
            </div>
         }
  </div>
  `,
	imports: [GurlHighlightedInput, SystemIconComponent],
})
export class ReqPath {
	protected readonly f = inject(FormService);
	protected readonly appSvc = inject(AppService);
}
