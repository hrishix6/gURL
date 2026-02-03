import { Component, HostBinding, inject } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import { KeyValFormItem } from "@/common/components";
import { parseTextAsKeyVal } from "@/common/utils/time";
import { BULK_EDIT_INSTRUCTION, HID_PLACEHOLDER } from "@/constants";
import { FormService } from "@/services";
import { BulkKeyValEditor } from "../common/components/bulk.editor";

@Component({
	selector: "gurl-req-headers",
	template: `
   <div class="flex-1 p-1 overflow-y-auto">
         @if(f.headerSvc.bulkEditModeHeaders()){
         <gurl-bulk-editor
          [editInstructions]="bulkHeadersEditInstruction"
          [parseFn]="parseTextAsKeyValFn"
          [initialValue]="f.headerSvc.bulkHeadersText()"
          (onChange)="f.bulkUpdateHeadersParams($event)"
          /> 
      }
      @else {
         <gurl-keyval-item
          [placeholderId]="placeHolderHeaderId"
          [items]="f.headerSvc.headers()"
          (onDelete)="f.deleteHeader($event)"
          (onKeyUpdate)="f.updateHeader($event.id, 'key', $event.v)"
          (onValUpdate)="f.updateHeader($event.id, 'val', $event.v)"
          (onBlur)="f.headerSvc.addHeader()"
          (onEnabledUpdate)="f.updateHeader($event.id, 'enabled', $event.v)">
    </gurl-keyval-item>
      }
   </div>
  `,
	imports: [KeyValFormItem, LucideAngularModule, BulkKeyValEditor],
})
export class ReqHeaders {
	@HostBinding("class")
	defaultClass = "flex-1 flex flex-col overflow-hidden";

	protected readonly bulkHeadersEditInstruction = BULK_EDIT_INSTRUCTION;
	protected readonly parseTextAsKeyValFn = parseTextAsKeyVal;

	protected readonly placeHolderHeaderId = HID_PLACEHOLDER;
	protected readonly f = inject(FormService);
}
