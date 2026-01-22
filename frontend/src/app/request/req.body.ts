import { Component, HostBinding, inject } from "@angular/core";
import { Ban, LucideAngularModule } from "lucide-angular";
import { KeyValFormItem, MultiPartFormItem } from "@/common/components";
import { parseTextAsKeyVal } from "@/common/utils/time";
import {
	BULK_EDIT_INSTRUCTION,
	MULTIPART_ID_PLACEHOLDER,
	REQ_BODY_TYPES,
	URLENCODED_ID_PLACEHOLDER,
} from "@/constants";
import { FormService } from "@/services";
import { BulkKeyValEditor } from "./bulk.editor";
import { FileInput } from "./file.input";

@Component({
	selector: "app-req-body",
	template: `
    <div class="flex-1 overflow-y-auto relative p-1">
      @switch (f.bodySvc.bodyType().id) { @case("none") {
      <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
        <lucide-angular [img]="NoneIcon" class="size-16 -z-10" />
      </div>
      } @case("multipart"){
        <app-multipart-item
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
            <app-bulk-keyval-editor
            [editInstructions]="bulkUrlFormEditInstruction"
            [parseFn]="parseTextAsKeyValFn"
            [initialValue]="f.bodySvc.bulkUrlEncodedFormText()"
            (onChange)="f.bulkUpdateUrlEncodedForm($event)"
            >
           </app-bulk-keyval-editor>
        }@else {
           <app-keyval-item
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
      <textarea
        class="textarea textarea-ghost textarea-primary bg-base-300 xl:textarea-lg w-full h-full"
        (input)="handleTextBodyUpdate($event)"
        [value]="f.bodySvc.textBody()"
      ></textarea>
      } @case("xml") {
      <textarea
        class="textarea textarea-ghost textarea-primary bg-base-300 xl:textarea-lg w-full h-full"
        (input)="handleTextBodyUpdate($event)"
        [value]="f.bodySvc.textBody()"
      ></textarea>
      } @case ("plaintext") {
      <textarea
        class="textarea textarea-ghost textarea-primary bg-base-300 xl:textarea-lg w-full h-full"
        (input)="handleTextBodyUpdate($event)"
        [value]="f.bodySvc.textBody()"
      ></textarea>
      } @case ("binary") {
      <div class="absolute top-0 left-0 w-full h-full flex justify-center items-center">
        <app-file-input />
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
	],
})
export class ReqBody {
	readonly NoneIcon = Ban;
	readonly placeHolderUrlEncodedId = URLENCODED_ID_PLACEHOLDER;
	readonly placeHolderMultipartId = MULTIPART_ID_PLACEHOLDER;
	readonly reqBodyTypes = REQ_BODY_TYPES;

	@HostBinding("class")
	defaultClass = "flex-1 flex flex-col overflow-hidden";

	readonly f = inject(FormService);

	readonly bulkUrlFormEditInstruction = BULK_EDIT_INSTRUCTION;
	readonly parseTextAsKeyValFn = parseTextAsKeyVal;

	handleTextBodyUpdate(e: Event) {
		const target = e.target as HTMLInputElement;
		this.f.setTextBody(target.value);
	}
}
