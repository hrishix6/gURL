import { Component, HostBinding, inject, signal } from "@angular/core";
import { LucideAngularModule, SquarePen } from "lucide-angular";
import { KeyValFormItem } from "../common/components";
import { QID_PLACEHOLDER } from "../../constants";
import { FormService } from "../services";
import { BulkKeyValEditor } from "./bulk.editor";

@Component({
	selector: "app-req-query",
	template: `
  <div class="flex-1 overflow-y-auto px-1 py-2">
     @if(bulkEditMode()){
         <app-bulk-keyval-editor
          [initialValue]="formSvc.bulkQueryParamText()"
          (onChange)="formSvc.bulkUpdateQueryParams($event)"
          >
        </app-bulk-keyval-editor>
      }
      @else {
        <app-keyval-item
        [placeholderId]="placeHolderQueryId"
        [items]="formSvc.queryParams()"
        (onDelete)="formSvc.deleteQueryParam($event)"
        (onKeyUpdate)="formSvc.updateQueryParam($event.id, 'key', $event.v)"
        (onValUpdate)="formSvc.updateQueryParam($event.id, 'val', $event.v)"
        (onEnabledUpdate)="formSvc.updateQueryParam($event.id, 'enabled', $event.v)"
        (onBlur)="formSvc.addQueryParam()"
        >
        </app-keyval-item>
      }
  </div>
  <footer class="flex p-2">
        <label class="label text-sm xl:text-md">
            <input type="checkbox" [checked]="bulkEditMode()" (change)="handleEditModeChane($event)" class="hidden"/>
            <lucide-angular [img]="BulkEditIcon" class="size-4 {{bulkEditMode()? 'text-primary': ''}}" />
            @if(bulkEditMode()){
              <span class="ml-0.5 text-primary">Normal</span> 
            }@else{
              <span class="ml-0.5">Bulk Edit</span> 
            }
         </label> 
  </footer>
  `,
	imports: [KeyValFormItem, BulkKeyValEditor, LucideAngularModule],
})
export class ReqQuery {
	@HostBinding("class")
	defaultClass = "flex-1 flex flex-col overflow-hidden";
	readonly BulkEditIcon = SquarePen;

	bulkEditMode = signal<boolean>(false);

	readonly placeHolderQueryId = QID_PLACEHOLDER;
	readonly formSvc = inject(FormService);

	readonly bulkEditInstructions =
		"Each entry must be on new line\nKey and value are delimited by ' : '\nTo keep item disabled start the row with ' # '";

	bulkEditText = signal<string>("");

	handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		this.bulkEditText.set(target.value);
	}

	handleEditModeChane(e: Event) {
		const target = e.target as HTMLInputElement;
		this.bulkEditMode.set(target.checked);
	}
}
