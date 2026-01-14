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
   <div class="flex-1 p-1 overflow-y-auto">
         @if(f.headerSvc.bulkEditModeHeaders()){
         <app-bulk-keyval-editor
          [editInstructions]="bulkHeadersEditInstruction"
          [parseFn]="parseTextAsKeyValFn"
          [initialValue]="f.headerSvc.bulkHeadersText()"
          (onChange)="f.headerSvc.bulkUpdateHeadersParams($event)"
          >
        </app-bulk-keyval-editor>
      }
      @else {
         <app-keyval-item
          [placeholderId]="placeHolderHeaderId"
          [items]="f.headerSvc.headers()"
          (onDelete)="f.headerSvc.deleteHeader($event)"
          (onKeyUpdate)="f.headerSvc.updateHeader($event.id, 'key', $event.v)"
          (onValUpdate)="f.headerSvc.updateHeader($event.id, 'val', $event.v)"
          (onBlur)="f.headerSvc.addHeader()"
          (onEnabledUpdate)="f.headerSvc.updateHeader($event.id, 'enabled', $event.v)">
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
	readonly f = inject(FormService);
}
