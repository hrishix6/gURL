import { Component, HostBinding, inject, signal } from "@angular/core";
import { Ban, LucideAngularModule } from "lucide-angular";
import { KeyValFormItem } from "@/common/components";
import { parseTextAsKeyVal } from "@/common/utils/text";
import { BULK_EDIT_INSTRUCTION, QID_PLACEHOLDER } from "@/constants";
import { FormService } from "@/services";
import { BulkKeyValEditor } from "../common/components/bulk.editor";

@Component({
	selector: "gurl-req-query",
	template: `
  <div class="flex-1 overflow-y-auto p-1 relative">
     @if(f.urlSvc.bulkEditModeQuery()){
         <gurl-bulk-editor
          [editInstructions]="bulkQueryEditInstruction"
          [parseFn]="parseTextAsKeyValFn"
          [initialValue]="f.urlSvc.bulkQueryParamText()"
          (onChange)="f.bulkUpdateQueryParams($event)"
          />
      }
      @else {
         @if(f.urlSvc.queryParams().length === 0 && f.tabType() === 'req_example'){
            <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
               <lucide-angular [img]="NoneIcon" class="size-16 -z-10" />
            </div>
         }@else {
          <gurl-keyval-item
          [placeholderId]="placeHolderQueryId"
          [items]="f.urlSvc.queryParams()"
          [tabType]="f.tabType()"
          (onDelete)="f.deleteQueryParam($event)"
          (onKeyUpdate)="f.updateQueryParam($event.id, 'key', $event.v)"
          (onValUpdate)="f.updateQueryParam($event.id, 'val', $event.v)"
          (onEnabledUpdate)="f.updateQueryParam($event.id, 'enabled', $event.v)"
          (onBlur)="f.urlSvc.addQueryParam()"
          >
          </gurl-keyval-item>
         }
      }
  </div>
  `,
	imports: [KeyValFormItem, BulkKeyValEditor, LucideAngularModule],
})
export class ReqQuery {
	@HostBinding("class")
	defaultClass = "flex-1 flex flex-col overflow-hidden";

	protected readonly bulkQueryEditInstruction = BULK_EDIT_INSTRUCTION;
	protected readonly parseTextAsKeyValFn = parseTextAsKeyVal;
	protected readonly f = inject(FormService);
	protected readonly placeHolderQueryId = QID_PLACEHOLDER;
	protected readonly bulkEditInstructions =
		"Each entry must be on new line\nKey and value are delimited by ' : '\nTo keep item disabled start the row with ' # '";

	protected bulkEditText = signal<string>("");
	protected readonly NoneIcon = Ban;

	protected handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		this.bulkEditText.set(target.value);
	}
}
