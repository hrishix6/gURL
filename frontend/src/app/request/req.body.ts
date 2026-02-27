import { Component, HostBinding, inject } from "@angular/core";
import { Ban, LucideAngularModule } from "lucide-angular";
import { KeyValFormItem, MultiPartFormItem } from "@/common/components";
import { TextEditor } from "@/common/components/text.editor";
import { parseTextAsKeyVal } from "@/common/utils/text";
import {
	BULK_EDIT_INSTRUCTION,
	MULTIPART_ID_PLACEHOLDER,
	REQ_BODY_TYPES,
	URLENCODED_ID_PLACEHOLDER,
} from "@/constants";
import { FormService } from "@/services";
import { BulkKeyValEditor } from "../common/components/bulk.editor";
import { FileInput } from "./file.input";

@Component({
	selector: "gurl-req-body",
	template: `
    <div class="flex-1 overflow-y-auto relative p-1">
      @switch (f.bodySvc.bodyType().id) { @case("none") {
      <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
        <lucide-angular [img]="NoneIcon" class="size-16 -z-10" />
      </div>
      } @case("multipart"){
        <gurl-multipart-item
            [tabType]="f.tabType()"
            [placeholderId]="placeHolderMultipartId"
            [items]="f.bodySvc.multipartForm()"
            (onDelete)="f.deleteMultipartItem($event)"
            (onKeyUpdate)="f.updateMultiPartField($event.id, 'key', $event.v)"
            (onValUpdate)="f.updateMultipartFieldValue($event.id, $event.v)"
            (onBlur)="f.bodySvc.addMultiPartField()"
            (onEnabledUpdate)="f.updateMultiPartField($event.id, 'enabled', $event.v)"
            (onClearFileInput)="f.clearMultipartFileInput($event.id)"
          />
      } @case("urlencoded"){
        @if(f.bodySvc.bulkEditModeUrlEncodedForm()){
            <gurl-bulk-editor
              [editInstructions]="bulkUrlFormEditInstruction"
              [parseFn]="parseTextAsKeyValFn"
              [initialValue]="f.bodySvc.bulkUrlEncodedFormText()"
              (onChange)="f.bulkUpdateUrlEncodedForm($event)"
            />
        }@else {
           <gurl-keyval-item
            [tabType]="f.tabType()"
            [placeholderId]="placeHolderUrlEncodedId"
            [items]="f.bodySvc.urlEncodedParams()"
            (onDelete)="f.deleteUrlEncodedField($event)"
            (onKeyUpdate)="f.updateUrlEncodedField($event.id, 'key', $event.v)"
            (onValUpdate)="f.updateUrlEncodedField($event.id, 'val', $event.v)"
            (onBlur)="f.bodySvc.addUrlEncodedField()"
            (onEnabledUpdate)="f.updateUrlEncodedField($event.id, 'enabled', $event.v)"
          />
        }
      } @case("json"){
      <gurl-text-editor 
      [value]="f.bodySvc.textBody()"
      [readonly]="f.tabType()==='req_example'"
      (onInput)="handleTextBodyUpdate($event)"
      />
      } @case("xml") {
      <gurl-text-editor 
      [value]="f.bodySvc.textBody()"
      [readonly]="f.tabType()==='req_example'"
      (onInput)="handleTextBodyUpdate($event)"
      />
      } @case ("plaintext") {
      <gurl-text-editor 
      [value]="f.bodySvc.textBody()"
      [readonly]="f.tabType()==='req_example'"
      (onInput)="handleTextBodyUpdate($event)"
      />
      } @case ("binary") {
      <div class="absolute top-0 left-0 w-full h-full flex justify-center items-center">
        <gurl-file-input />
      </div>
      } }
    </div>
  `,
	imports: [
		KeyValFormItem,
		MultiPartFormItem,
		LucideAngularModule,
		FileInput,
		BulkKeyValEditor,
		TextEditor,
	],
})
export class ReqBody {
	@HostBinding("class")
	defaultClass = "flex-1 flex flex-col overflow-hidden";

	protected readonly NoneIcon = Ban;
	protected readonly placeHolderUrlEncodedId = URLENCODED_ID_PLACEHOLDER;
	protected readonly placeHolderMultipartId = MULTIPART_ID_PLACEHOLDER;
	protected readonly reqBodyTypes = REQ_BODY_TYPES;

	protected readonly f = inject(FormService);

	protected readonly bulkUrlFormEditInstruction = BULK_EDIT_INSTRUCTION;
	protected readonly parseTextAsKeyValFn = parseTextAsKeyVal;

	protected handleTextBodyUpdate(e: Event) {
		const target = e.target as HTMLInputElement;
		this.f.setTextBody(target.value);
	}
}
