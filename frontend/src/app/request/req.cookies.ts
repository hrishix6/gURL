import { Component, inject } from "@angular/core";
import { KeyValFormItem } from "@/common/components";
import { SystemIconComponent } from "@/common/components/icon";
import { parseTextAsCookies } from "@/common/utils/text";
import { BULK_EDIT_COOKIES_INSTRUCTION, COOKIE_PLACEHOLDER } from "@/constants";
import { AppService, FormService } from "@/services";
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
                <i gurl-icon [icon]="'Empty'" [className]="'size-16 -z-10'" ></i>
            </div>
         }@else {
          <gurl-keyval-item
            [placeholderId]="placeHolderId"
            [activeEnvSub]="appSvc.activeEnvChange$"
            [items]="f.cookieSvc.cookies()"
            [extractTokensFn]="f.reqFormExtractTokensCB"
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
	imports: [KeyValFormItem, BulkKeyValEditor, SystemIconComponent],
})
export class ReqCookies {
	protected readonly bulkcookieEditInstruction = BULK_EDIT_COOKIES_INSTRUCTION;
	protected readonly parseCookieTextFn = parseTextAsCookies;
	protected readonly placeHolderId = COOKIE_PLACEHOLDER;
	protected readonly f = inject(FormService);
	protected readonly appSvc = inject(AppService);
}
