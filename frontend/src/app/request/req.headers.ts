import { Component, HostBinding, inject } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import { KeyValFormItem } from "@/common/components";
import { parseTextAsKeyVal } from "@/common/utils/time";
import { BULK_EDIT_INSTRUCTION, HID_PLACEHOLDER } from "@/constants";
import { FormService } from "@/services";
import { BulkKeyValEditor } from "./bulk.editor";

@Component({
	selector: "app-req-headers",
	template: `
   <div class="flex-1 py-2 px-1 overflow-y-auto">
         @if(formSvc.bulkEditModeHeaders()){
         <app-bulk-keyval-editor
          [editInstructions]="bulkHeadersEditInstruction"
          [parseFn]="parseTextAsKeyValFn"
          [initialValue]="formSvc.bulkHeadersText()"
          (onChange)="formSvc.bulkUpdateHeadersParams($event)"
          >
        </app-bulk-keyval-editor>
      }
      @else {
         <app-keyval-item
          [placeholderId]="placeHolderHeaderId"
          [items]="formSvc.headers()"
          (onDelete)="formSvc.deleteHeader($event)"
          (onKeyUpdate)="formSvc.updateHeader($event.id, 'key', $event.v)"
          (onValUpdate)="formSvc.updateHeader($event.id, 'val', $event.v)"
          (onBlur)="formSvc.addHeader()"
          (onEnabledUpdate)="formSvc.updateHeader($event.id, 'enabled', $event.v)">
    </app-keyval-item>
      }
   </div>
  `,
	imports: [KeyValFormItem, LucideAngularModule, BulkKeyValEditor],
})
export class ReqHeaders {
	readonly bulkHeadersEditInstruction = BULK_EDIT_INSTRUCTION;
	readonly parseTextAsKeyValFn = parseTextAsKeyVal;

	@HostBinding("class")
	defaultClass = "flex-1 flex flex-col overflow-hidden";

	readonly placeHolderHeaderId = HID_PLACEHOLDER;
	readonly formSvc = inject(FormService);
}
