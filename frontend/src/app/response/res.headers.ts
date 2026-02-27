import { Component, HostBinding, inject } from "@angular/core";
import { Ban, LucideAngularModule } from "lucide-angular";
import { FormService } from "@/services";

@Component({
	selector: "gurl-res-headers",
	template: `
    @if(formSvc.res()?.resHeaders?.length) {
        <div class="flex-1 overflow-y-auto flex">
            @if(formSvc.headersPreviewMode()){
                <div class="flex-1 flex flex-col gap-2">
                    <div class="flex flex-col gap-2">
                         <h3 class="font-semibold ml-1">Request ({{ formSvc.res()?.reqHeaders?.length }})</h3>
                          <div class="border border-base-100 rounded-box flex-1">
                            <table class="table table-fixed">
                                    <thead>
                                        <tr>
                                        <th class="w-2/5">Name</th>
                                        <th>Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @for (item of formSvc.res()?.reqHeaders; track $index) {
                                        <tr>
                                        <td class="break-all">
                                            {{ item.key || '' }}
                                        </td>
                                        <td class="break-all">
                                            {{ item.val || '' }}
                                        </td>
                                        </tr>
                                        }
                                    </tbody>
                                </table>
                        </div>
                    </div>            
                    <div class="flex flex-col gap-2">
                            <h3 class="font-semibold ml-1">Response ({{ formSvc.res()?.resHeaders?.length }})</h3>
                            <div class="border border-base-100 rounded-box">
                            <table class="table table-fixed">
                                    <thead>
                                        <tr>
                                        <th class="w-2/5">Name</th>
                                        <th>Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @for (item of formSvc.res()?.resHeaders; track $index) {
                                        <tr>
                                        <td class="break-all">
                                            {{ item.key || '' }}
                                        </td>
                                        <td class="break-all">
                                            {{ item.val || '' }}
                                        </td>
                                        </tr>
                                        }
                                    </tbody>
                            </table>
                            </div>
                    </div>

                </div>
            }
            @else {
                <div class="flex-1 flex flex-col gap-2">
                    <div class="flex flex-col gap-2">
                         <h3 class="font-semibold ml-1">Request ({{ formSvc.res()?.reqHeaders?.length }})</h3>
                         <pre class="w-full h-full border-0 outline-0 p-2 wrap-break-word">{{formSvc.reqHeadersRaw() || ''}}</pre>
                    </div>
                    <div class="p-px bg-base-100"></div>
                    <div class="flex flex-col gap-2">
                         <h3 class="font-semibold ml-1">Response ({{ formSvc.res()?.resHeaders?.length }})</h3>
                        <pre class="w-full h-full border-0 outline-0 p-2 wrap-break-word">{{formSvc.resHeadersRaw() || ''}}</pre>
                    </div>
                </div>
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
	@HostBinding("class")
	def = "flex-1 flex overflow-hidden relative py-1";

	protected readonly NoneIcon = Ban;
	protected readonly formSvc = inject(FormService);
}
