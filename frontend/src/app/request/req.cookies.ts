import { Component, HostBinding, inject } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import { KeyValFormItem } from "@/common/components";
import { parseTextAsCookies } from "@/common/utils/time";
import { BULK_EDIT_COOKIES_INSTRUCTION, COOKIE_PLACEHOLDER } from "@/constants";
import { FormService } from "@/services";
import { BulkKeyValEditor } from "./bulk.editor";

@Component({
	selector: "app-req-cookies",
	template: `
   <div class="flex-1 p-1 overflow-y-auto">
         @if(f.cookieSvc.bulkEditModeCookies()){
         <app-bulk-keyval-editor
          [editInstructions]="bulkcookieEditInstruction"
          [parseFn]="parseCookieTextFn"
          [initialValue]="f.cookieSvc.bulkCookiesText()"
          (onChange)="f.cookieSvc.bulkUpdateCookieParams($event)"
          >
        </app-bulk-keyval-editor>
      }
      @else {
         <app-keyval-item
          [placeholderId]="placeHolderId"
          [items]="f.cookieSvc.cookies()"
          (onDelete)="f.cookieSvc.deleteCookie($event)"
          (onKeyUpdate)="f.cookieSvc.updateCookie($event.id, 'key', $event.v)"
          (onValUpdate)="f.cookieSvc.updateCookie($event.id, 'val', $event.v)"
          (onBlur)="f.cookieSvc.addCookie()"
          (onEnabledUpdate)="f.cookieSvc.updateCookie($event.id, 'enabled', $event.v)">
        </app-keyval-item>
      }
   </div>
  `,
	imports: [KeyValFormItem, LucideAngularModule, BulkKeyValEditor],
})
export class ReqCookies {
	@HostBinding("class")
	defaultClass = "flex-1 flex flex-col overflow-hidden";

	readonly bulkcookieEditInstruction = BULK_EDIT_COOKIES_INSTRUCTION;
	readonly parseCookieTextFn = parseTextAsCookies;

	readonly placeHolderId = COOKIE_PLACEHOLDER;
	readonly f = inject(FormService);
}
