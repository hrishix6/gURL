import { Component, inject } from "@angular/core";
import { KeyValFormItem, MultiPartFormItem } from "@/common/components";
import { CodeEditor } from "@/common/components/code-editor";
import { SystemIconComponent } from "@/common/components/icon";
import { parseTextAsKeyVal } from "@/common/utils/text";
import {
	BULK_EDIT_INSTRUCTION,
	MULTIPART_ID_PLACEHOLDER,
	REQ_BODY_TYPES,
	URLENCODED_ID_PLACEHOLDER,
} from "@/constants";
import { AppService, FormService } from "@/services";
import { AppTabType } from "@/types";
import { BulkKeyValEditor } from "../common/components/bulk.editor";
import { FileInput } from "./file.input";

@Component({
	selector: "gurl-req-body",
	template: `
    <div class="flex-1 overflow-y-auto relative py-1">
      @switch (f.bodySvc.bodyType().id) { @case("none") {
      <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
         <i gurl-icon [icon]="'Empty'" [className]="'size-16 -z-10'" ></i>
      </div>
      } @case("multipart"){
        <gurl-multipart-item
            [tabType]="f.tabType()"
            [placeholderId]="placeHolderMultipartId"
            [items]="f.bodySvc.multipartForm()"
            [activeEnvSub]="appSvc.activeEnvChange$"
            [extractTokensFn]="f.reqFormExtractTokensCB"
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
            [activeEnvSub]="appSvc.activeEnvChange$"
            [extractTokensFn]="f.reqFormExtractTokensCB"
            [items]="f.bodySvc.urlEncodedParams()"
            (onDelete)="f.deleteUrlEncodedField($event)"
            (onKeyUpdate)="f.updateUrlEncodedField($event.id, 'key', $event.v)"
            (onValUpdate)="f.updateUrlEncodedField($event.id, 'val', $event.v)"
            (onBlur)="f.bodySvc.addUrlEncodedField()"
            (onEnabledUpdate)="f.updateUrlEncodedField($event.id, 'enabled', $event.v)"
          />
        }
      } @case("json"){
      <gurl-code-editor 
        [mode]="f.bodySvc.bodyType().id"
        [envChange$]="appSvc.activeEnvChange$"
        [resolveVar]="f.resolveEnvVariable"
        [readonly]="f.tabType()==='req_example'"
        [text]="f.bodySvc.textBody()"
        (onChange)="f.setTextBody($event)"
        [formatText$]="f.bodySvc.formatText$"
      />
      } @case("xml") {
      <gurl-code-editor 
        [mode]="f.bodySvc.bodyType().id"
        [resolveVar]="f.resolveEnvVariable"
        [envChange$]="appSvc.activeEnvChange$"
        [readonly]="f.tabType()==='req_example'"
        [text]="f.bodySvc.textBody()"
        (onChange)="f.setTextBody($event)"
        [formatText$]="f.bodySvc.formatText$"
      />
      } @case ("plaintext") {
      <gurl-code-editor 
        [mode]="f.bodySvc.bodyType().id"
        [envChange$]="appSvc.activeEnvChange$"
        [resolveVar]="f.resolveEnvVariable"
        [readonly]="f.tabType()==='req_example'"
        [text]="f.bodySvc.textBody()"
        (onChange)="f.setTextBody($event)"
      />
      } @case ("binary") {
      <div class="absolute top-0 left-0 w-full h-full flex justify-center items-center">
        <gurl-file-input 
        [binaryBody]="f.bodySvc.binaryBody()"
        [tabType]="tabType"
        (onClearFile)="f.clearBinaryBody()"
        (onFileStats)="f.setBinaryBody($event)"
        />
      </div>
      } }
    </div>
  `,
	imports: [
		KeyValFormItem,
		MultiPartFormItem,
		FileInput,
		BulkKeyValEditor,
		SystemIconComponent,
		CodeEditor,
	],
})
export class ReqBody {
	protected readonly placeHolderUrlEncodedId = URLENCODED_ID_PLACEHOLDER;
	protected readonly placeHolderMultipartId = MULTIPART_ID_PLACEHOLDER;
	protected readonly reqBodyTypes = REQ_BODY_TYPES;
	protected readonly tabType = AppTabType.Req;

	protected readonly f = inject(FormService);
	protected readonly appSvc = inject(AppService);

	protected readonly bulkUrlFormEditInstruction = BULK_EDIT_INSTRUCTION;
	protected readonly parseTextAsKeyValFn = parseTextAsKeyVal;

	protected handleTextBodyUpdate(e: Event) {
		const target = e.target as HTMLInputElement;
		this.f.setTextBody(target.value);
	}
}
