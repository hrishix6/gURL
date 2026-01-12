import { Component, HostBinding, inject } from "@angular/core";
import { Ban, LucideAngularModule } from "lucide-angular";
import { FormService } from "@/services";

@Component({
	selector: "div[resHeaders]",
	template: `
    @if(formSvc.res()?.headers?.length) {
        <div class="overflow-auto flex-1 rounded-box shadow-md border-2 border-base-100">
            @if(formSvc.headersPreviewMode()){
                <table class="table table-fixed w-full">
                    <thead>
                        <tr>
                        <th class="w-2/5">Name</th>
                        <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        @for (item of formSvc.res()?.headers; track $index) {
                        <tr>
                        <td>
                            {{ item.key || '' }}
                        </td>
                        <td>
                            {{ item.value || '' }}
                        </td>
                        </tr>
                        }
                    </tbody>
                </table>
            }
            @else {
                <pre class="w-full h-full border-0 outline-0 p-2 wrap-break-word">{{formSvc.headersRaw() || ''}}</pre>
            }
      </div>
    }
    @else {
        <div class="flex-1 flex items-center justify-center opacity-10">
            <lucide-angular [img]="NoneIcon" class="size-16 -z-10" />
        </div>
    }
    `,
	imports: [LucideAngularModule],
})
export class ResHeaders {
	readonly NoneIcon = Ban;
	formSvc = inject(FormService);
	@HostBinding("class")
	def = "flex-1 flex overflow-hidden relative";
}
