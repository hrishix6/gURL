import { Component, HostBinding, inject } from "@angular/core";
import { Ban, Eye, EyeOff, LucideAngularModule } from "lucide-angular";
import { FormService } from "@/services";

@Component({
	selector: `div[resCookies]`,
	template: `
        @if(formSvc.res()?.cookies?.length){
            <div class="flex-1 flex overflow-auto shadow-md border-2 border-base-100">
            @if(formSvc.cookiesPreviewMode()){
                <div class="flex-1 flex flex-col gap-2 p-2">
                @for(item of formSvc.res()?.cookies; track item.name){
                 <div class="collapse collapse-arrow shadow-md border-2 border-base-100 w-full">
                    <input type="checkbox"  />
                    <div class="collapse-title font-semibold">Name: {{item.name}} , Value: {{item.value}}</div>
                    <div class="collapse-content text-xs">
                             <table class="table table-fixed w-full">
                                <thead>
                                    <tr>
                                    <th class="w-2/5">Attribute</th>
                                    <th>Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>
                                            Name
                                        </td>
                                        <td>
                                            {{ item.name || '' }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Value
                                        </td>
                                        <td>
                                            {{ item.value || '' }}
                                        </td>
                                    </tr>
                                     <tr>
                                        <td>
                                            Path
                                        </td>
                                        <td>
                                            {{ item.path || '' }}
                                        </td>
                                    </tr>
                                     <tr>
                                        <td>
                                            Domain
                                        </td>
                                        <td>
                                            {{ item.domain || 'Host-Only' }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Expires
                                        </td>
                                        <td>
                                            {{ item.expires || 'Session' }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Max-Age
                                        </td>
                                        <td>
                                            {{ item.maxAge || 'Session' }}
                                        </td>
                                    </tr>
                                     <tr>
                                        <td>
                                            HttpOnly
                                        </td>
                                        <td>
                                            {{ item.httpOnly || 'False' }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Secure
                                        </td>
                                        <td>
                                            {{ item.secure || 'False' }}
                                        </td>
                                    </tr>
                                     <tr>
                                        <td>
                                            SameSite
                                        </td>
                                        <td>
                                            @switch (item.sameSite) {
                                                @case(1){
                                                    Not Set
                                                }
                                                @case(2){
                                                    Lax
                                                }
                                                @case(3){
                                                    Strict
                                                }
                                                @case(4){
                                                    None
                                                }
                                                @default {
                                                    Client Defined
                                                }
                                            }
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                    </div>
                </div>
                }
                </div>
            }
            @else {
                 <div class="flex-1 flex flex-col gap-2 p-2">
                    @for(item of formSvc.res()?.cookies; track item.name){
                      <p class="p-2 shadow-md border-2 border-base-100">
                       Set-Cookie: {{item.raw}}
                     </p>
                    }
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
export class ResCookies {
	readonly PreviewOpenIcon = Eye;
	readonly PreviewCloseIcon = EyeOff;

	@HostBinding("class")
	def = "flex-1 flex overflow-hidden";

	readonly NoneIcon = Ban;

	readonly formSvc = inject(FormService);
}
