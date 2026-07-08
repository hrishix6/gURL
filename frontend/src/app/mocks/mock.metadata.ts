import { NgClass } from "@angular/common";
import { Component, inject } from "@angular/core";
import { KeyValFormItem } from "@/common/components";
import { BulkKeyValEditor } from "@/common/components/bulk.editor";
import { SystemIconComponent } from "@/common/components/icon";
import { parseTextAsCookies, parseTextAsKeyVal } from "@/common/utils/text";
import {
	BULK_EDIT_COOKIES_INSTRUCTION,
	BULK_EDIT_INSTRUCTION,
	COOKIE_PLACEHOLDER,
	HID_PLACEHOLDER,
} from "@/constants";
import { MockTabFormService } from "@/services";
import { AppTabType } from "@/types";

@Component({
	selector: `gurl-mock-metadata`,
	template: `
        <!-- Response status, delay, and environment -->
         <div class="flex items-center gap-2 px-1">
            <fieldset class="fieldset flex-1">
                <legend class="fieldset-legend">Status Code</legend>
                <input
                    type="text"
                    [placeholder]="'key'"
                    [ngClass]="{
                        'input input-sm w-full bg-base-300 xl:input-md': true,
                        'input-error': f.statusInvalid(),
                        'input-ghost input-primary': !f.statusInvalid(),
                    }"
                    [value]="f.mockstatusCode()"
                    (input)="f.setMockStatusCode($event.target.value)"
                    (blur)="f.statusCodeDefault()"
                    [disabled]="false"
                    [readOnly]="false"
                    />
            </fieldset>
            <fieldset class="fieldset flex-1">
                <legend class="fieldset-legend">Delay(sec)</legend>
                 <input
                    type="text"
                    [placeholder]="'Delay'"
                    [ngClass]="{
                        'input input-sm w-full bg-base-300 xl:input-md': true,
                         'input-error': f.delayInvalid(),
                        'input-ghost input-primary': !f.delayInvalid(),
                    }"
                    [value]="f.mockDelaySeconds()"
                    (input)="f.setMockDelaySeconds($event.target.value)"
                    (blur)="f.delayDefault()"
                    [disabled]="false"
                    [readOnly]="false"
                    />
            </fieldset>
         </div>
        <!-- Response headers -->
        <section class="flex-1 flex flex-col gap-1 overflow-hidden mt-2">
            <h4 class="text-md font-semibold px-1">
                Headers
            </h4>
            <div class="flex-1 p-1 overflow-y-auto relative px-1">
                @if(f.headerSvc.bulkEditModeHeaders()){
                <gurl-bulk-editor
                [editInstructions]="bulkHeadersEditInstruction"
                [parseFn]="parseTextAsKeyValFn"
                [initialValue]="f.headerSvc.bulkHeadersText()"
                (onChange)="f.bulkUpdateHeadersParams($event)"
                /> 
            }
            @else {
                @if(f.headerSvc.headers().length === 0){
                    <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
                        <i gurl-icon [icon]="'Empty'" [className]="'size-16 -z-10'" ></i>
                    </div>
                }@else {
                    <gurl-keyval-item
                    [placeholderId]="placeHolderHeaderId"
                    [items]="f.headerSvc.headers()"
                    [tabType]="tabType"
                    (onDelete)="f.deleteHeader($event)"
                    (onKeyUpdate)="f.updateHeader($event.id, 'key', $event.v)"
                    (onValUpdate)="f.updateHeader($event.id, 'val', $event.v)"
                    [extractTokensFn]="f.mockTabExtractTokensCB"
                    [activeEnvSub]="f.activeEnvChange$"
                    (onBlur)="f.addHeader()"
                    (onEnabledUpdate)="f.updateHeader($event.id, 'enabled', $event.v)">
                    </gurl-keyval-item>
                }
            }
            </div>
            <div class="flex items-center text-sm">
                 <label class="label ml-auto">
                    <input type="checkbox" [checked]="f.headerSvc.bulkEditModeHeaders()" (change)="this.f.headerSvc.toggleEditModeHeaders()" class="toggle toggle-primary" />
                        Raw
                </label>
            </div>
        </section>
    `,
	imports: [BulkKeyValEditor, KeyValFormItem, SystemIconComponent, NgClass],
})
export class MockMetadata {
	protected readonly parseTextAsKeyValFn = parseTextAsKeyVal;
	protected readonly tabType = AppTabType.Mock;

	protected readonly placeHolderHeaderId = HID_PLACEHOLDER;
	protected readonly bulkHeadersEditInstruction = BULK_EDIT_INSTRUCTION;

	protected readonly bulkcookieEditInstruction = BULK_EDIT_COOKIES_INSTRUCTION;
	protected readonly parseCookieTextFn = parseTextAsCookies;
	protected readonly cookiePlaceHolderId = COOKIE_PLACEHOLDER;

	protected readonly f = inject(MockTabFormService);
}
