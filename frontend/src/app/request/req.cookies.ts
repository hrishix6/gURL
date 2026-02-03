import { Component, HostBinding, inject } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import { KeyValFormItem } from "@/common/components";
import { parseTextAsCookies } from "@/common/utils/time";
import { BULK_EDIT_COOKIES_INSTRUCTION, COOKIE_PLACEHOLDER } from "@/constants";
import { FormService } from "@/services";
import { BulkKeyValEditor } from "../common/components/bulk.editor";

@Component({
	selector: "gurl-req-cookies",
	template: `
   <div class="flex-1 p-1 overflow-y-auto">
         @if(f.cookieSvc.bulkEditModeCookies()){
         <gurl-bulk-editor
          [editInstructions]="bulkcookieEditInstruction"
          [parseFn]="parseCookieTextFn"
          [initialValue]="f.cookieSvc.bulkCookiesText()"
          (onChange)="f.bulkUpdateCookieParams($event)"
          />
      }
      @else {
         <gurl-keyval-item
          [placeholderId]="placeHolderId"
          [items]="f.cookieSvc.cookies()"
          (onDelete)="f.deleteCookie($event)"
          (onKeyUpdate)="f.updateCookie($event.id, 'key', $event.v)"
          (onValUpdate)="f.updateCookie($event.id, 'val', $event.v)"
          (onBlur)="f.cookieSvc.addCookie()"
          (onEnabledUpdate)="f.updateCookie($event.id, 'enabled', $event.v)">
        </gurl-keyval-item>
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
	protected readonly f = inject(FormService);
}
