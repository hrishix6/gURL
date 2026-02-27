import { Component, HostBinding, inject } from "@angular/core";
import { Ban, LucideAngularModule } from "lucide-angular";
import { GurlHighlightedInput } from "@/common/components/highlighted.input";
import { FormService } from "@/services";

@Component({
	selector: "gurl-req-path",
	template: `
  <div class="flex-1 overflow-y-auto p-1 relative">
         @if(f.urlSvc.pathParams().length === 0){
            <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
               <lucide-angular [img]="NoneIcon" class="size-16 -z-10" />
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
                        >
                        </div>
                        <div class="flex-2">
                            <div
                            gurl-highlighted-input
                            [placeHolder]="'value'"
                            [disabled]="false"
                            [text]="item.val"
                            (onInput)="f.urlSvc.updatePathParam(item.id, 'val', $event)"
                            [readonly]="false"
                            >
                            </div>
                        </div>
                    </div>
               }
            </div>
         }
  </div>
  `,
	imports: [LucideAngularModule, GurlHighlightedInput],
})
export class ReqPath {
	@HostBinding("class")
	defaultClass = "flex-1 flex flex-col overflow-hidden";

	protected readonly f = inject(FormService);
	protected readonly NoneIcon = Ban;
}
