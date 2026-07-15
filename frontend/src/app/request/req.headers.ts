import { Component, inject } from "@angular/core";
import { KeyValFormItem } from "@/common/components";
import { SystemIconComponent } from "@/common/components/icon";
import { parseTextAsKeyVal } from "@/common/utils/text";
import { BULK_EDIT_INSTRUCTION, HID_PLACEHOLDER } from "@/constants";
import { AppService, FormService } from "@/services";
import { BulkKeyValEditor } from "../common/components/bulk.editor";

@Component({
	selector: "gurl-req-headers",
	template: `
   <div class="flex-1 p-1 overflow-y-auto relative">
         @if(f.headerSvc.bulkEditModeHeaders()){
         <gurl-bulk-editor
          [editInstructions]="bulkHeadersEditInstruction"
          [parseFn]="parseTextAsKeyValFn"
          [initialValue]="f.headerSvc.bulkHeadersText()"
          (onChange)="f.bulkUpdateHeadersParams($event)"
          /> 
      }
      @else {
         @if(f.headerSvc.headers().length === 0 && f.tabType() === 'req_example'){
            <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
                <i gurl-icon [icon]="'Empty'" [className]="'size-16 -z-10'" ></i>
            </div>
         }@else {
            <gurl-keyval-item
            [placeholderId]="placeHolderHeaderId"
            [activeEnvSub]="appSvc.activeEnvChange$"
            [items]="f.headerSvc.headers()"
            [tabType]="f.tabType()"
            (onDelete)="f.deleteHeader($event)"
            [extractTokensFn]="f.reqFormExtractTokensCB"
            (onKeyUpdate)="f.updateHeader($event.id, 'key', $event.v)"
            (onValUpdate)="f.updateHeader($event.id, 'val', $event.v)"
            (onBlur)="f.headerSvc.addHeader()"
            (onEnabledUpdate)="f.updateHeader($event.id, 'enabled', $event.v)">
            </gurl-keyval-item>
         }
      }
   </div>
  `,
	imports: [KeyValFormItem, BulkKeyValEditor, SystemIconComponent],
})
export class ReqHeaders {
	protected readonly bulkHeadersEditInstruction = BULK_EDIT_INSTRUCTION;
	protected readonly parseTextAsKeyValFn = parseTextAsKeyVal;

	protected readonly placeHolderHeaderId = HID_PLACEHOLDER;
	protected readonly f = inject(FormService);
	protected readonly appSvc = inject(AppService);
}
