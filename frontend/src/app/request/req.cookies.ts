import { Component, HostBinding, inject } from "@angular/core";
import { Ban, LucideAngularModule } from "lucide-angular";
import { KeyValFormItem } from "@/common/components";
import { parseTextAsCookies } from "@/common/utils/time";
import { BULK_EDIT_COOKIES_INSTRUCTION, COOKIE_PLACEHOLDER } from "@/constants";
import { FormService } from "@/services";
import { BulkKeyValEditor } from "../common/components/bulk.editor";

@Component({
	selector: "gurl-req-cookies",
	template: `
   <div class="flex-1 p-1 overflow-y-auto relative">
         @if(f.cookieSvc.bulkEditModeCookies()){
         <gurl-bulk-editor
          [editInstructions]="bulkcookieEditInstruction"
          [parseFn]="parseCookieTextFn"
          [initialValue]="f.cookieSvc.bulkCookiesText()"
          (onChange)="f.bulkUpdateCookieParams($event)"
          />
      }
      @else {
         @if(f.cookieSvc.cookies().length === 0 && f.tabType() === 'req_example'){
            <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
               <lucide-angular [img]="NoneIcon" class="size-16 -z-10" />
            </div>
         }@else {
          <gurl-keyval-item
            [placeholderId]="placeHolderId"
            [items]="f.cookieSvc.cookies()"
            [tabType]="f.tabType()"
            (onDelete)="f.deleteCookie($event)"
            (onKeyUpdate)="f.updateCookie($event.id, 'key', $event.v)"
            (onValUpdate)="f.updateCookie($event.id, 'val', $event.v)"
            (onBlur)="f.cookieSvc.addCookie()"
            (onEnabledUpdate)="f.updateCookie($event.id, 'enabled', $event.v)">
          </gurl-keyval-item>
         }
      }
   </div>
  `,
	imports: [KeyValFormItem, LucideAngularModule, BulkKeyValEditor],
})
export class ReqCookies {
	@HostBinding("class")
	defaultClass = "flex-1 flex flex-col overflow-hidden";

	protected readonly bulkcookieEditInstruction = BULK_EDIT_COOKIES_INSTRUCTION;
	protected readonly parseCookieTextFn = parseTextAsCookies;

	protected readonly placeHolderId = COOKIE_PLACEHOLDER;
	protected readonly NoneIcon = Ban;
	protected readonly f = inject(FormService);
}
