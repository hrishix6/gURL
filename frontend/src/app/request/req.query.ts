import { Component, HostBinding, inject, signal } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import { KeyValFormItem } from "@/common/components";
import { parseTextAsKeyVal } from "@/common/utils/time";
import { BULK_EDIT_INSTRUCTION, QID_PLACEHOLDER } from "@/constants";
import { FormService } from "@/services";
import { BulkKeyValEditor } from "./bulk.editor";

@Component({
	selector: "app-req-query",
	template: `
  <div class="flex-1 overflow-y-auto p-1">
     @if(f.urlSvc.bulkEditModeQuery()){
         <app-bulk-keyval-editor
          [editInstructions]="bulkQueryEditInstruction"
          [parseFn]="parseTextAsKeyValFn"
          [initialValue]="f.urlSvc.bulkQueryParamText()"
          (onChange)="f.bulkUpdateQueryParams($event)"
          >
        </app-bulk-keyval-editor>
      }
      @else {
        <app-keyval-item
        [placeholderId]="placeHolderQueryId"
        [items]="f.urlSvc.queryParams()"
        (onDelete)="f.deleteQueryParam($event)"
        (onKeyUpdate)="f.updateQueryParam($event.id, 'key', $event.v)"
        (onValUpdate)="f.updateQueryParam($event.id, 'val', $event.v)"
        (onEnabledUpdate)="f.updateQueryParam($event.id, 'enabled', $event.v)"
        (onBlur)="f.urlSvc.addQueryParam()"
        >
        </app-keyval-item>
      }
  </div>
  `,
	imports: [KeyValFormItem, BulkKeyValEditor, LucideAngularModule],
})
export class ReqQuery {
	@HostBinding("class")
	defaultClass = "flex-1 flex flex-col overflow-hidden";

	readonly bulkQueryEditInstruction = BULK_EDIT_INSTRUCTION;
	readonly parseTextAsKeyValFn = parseTextAsKeyVal;

	readonly placeHolderQueryId = QID_PLACEHOLDER;
	readonly f = inject(FormService);

	readonly bulkEditInstructions =
		"Each entry must be on new line\nKey and value are delimited by ' : '\nTo keep item disabled start the row with ' # '";

	bulkEditText = signal<string>("");

	handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		this.bulkEditText.set(target.value);
	}
}
