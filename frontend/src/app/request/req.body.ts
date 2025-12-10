import { Component, HostBinding, inject } from '@angular/core';
import { Ban, LucideAngularModule } from 'lucide-angular';
import { KeyValFormItem, MultiPartFormItem } from '../../common/components';
import { MULTIPART_ID_PLACEHOLDER, URLENCODED_ID_PLACEHOLDER } from '../../constants';
import { FormService } from '../../services';
import { RequestBodySwitcher } from './body.switcher';
import { FileInput } from './file.input';

@Component({
  selector: 'app-req-body',
  template: `
    <div class="flex-1 p-2 overflow-y-auto relative">
      @switch (formSvc.bodyType().id) { @case("none") {
      <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
        <lucide-angular [img]="NoneIcon" class="size-16 -z-10" />
      </div>
      } @case("multipart"){
      <app-multipart-item
        [placeholderId]="placeHolderMultipartId"
        [items]="formSvc.multipartForm()"
        (onDelete)="formSvc.deleteMultipartItem($event)"
        (onKeyUpdate)="formSvc.updateMultiPartField($event.id, 'key', $event.v)"
        (onValUpdate)="formSvc.updateMultipartFieldValue($event.id, $event.v)"
        (onBlur)="formSvc.addMultiPartField()"
        (onEnabledUpdate)="formSvc.updateMultiPartField($event.id, 'enabled', $event.v)"
        (onClearFileInput)="formSvc.clearMultipartFileInput($event.id)"
      />
      } @case("urlencoded"){
      <app-keyval-item
        [placeholderId]="placeHolderUrlEncodedId"
        [items]="formSvc.urlEncodedParams()"
        (onDelete)="formSvc.deleteUrlEncodedField($event)"
        (onKeyUpdate)="formSvc.updateUrlEncodedField($event.id, 'key', $event.v)"
        (onValUpdate)="formSvc.updateUrlEncodedField($event.id, 'val', $event.v)"
        (onBlur)="formSvc.addUrlEncodedField()"
        (onEnabledUpdate)="formSvc.updateUrlEncodedField($event.id, 'enabled', $event.v)"
      >
      </app-keyval-item>
      } @case("json"){
      <textarea
        class="textarea textarea-primary xl:textarea-lg w-full h-full"
        (input)="handleTextBodyUpdate($event)"
        [value]="formSvc.textBody()"
      ></textarea>
      } @case("xml") {
      <textarea
        class="textarea textarea-primary xl:textarea-lg w-full h-full"
        (input)="handleTextBodyUpdate($event)"
        [value]="formSvc.textBody()"
      ></textarea>
      } @case ("plaintext") {
      <textarea
        class="textarea textarea-primary xl:textarea-lg w-full h-full"
        (input)="handleTextBodyUpdate($event)"
        [value]="formSvc.textBody()"
      ></textarea>
      } @case ("binary") {
      <div class="absolute top-0 left-0 w-full h-full flex justify-center items-center">
        <app-file-input />
      </div>
      } }
    </div>
    <footer class="flex px-2 justify-end">
      <app-req-body-switcher></app-req-body-switcher>
    </footer>
  `,
  imports: [KeyValFormItem, MultiPartFormItem, LucideAngularModule, FileInput, RequestBodySwitcher],
})
export class ReqBody {
  readonly NoneIcon = Ban;
  readonly placeHolderUrlEncodedId = URLENCODED_ID_PLACEHOLDER;
  readonly placeHolderMultipartId = MULTIPART_ID_PLACEHOLDER;

  @HostBinding('class')
  defaultClass = 'flex-1 flex flex-col gap-2 overflow-hidden';

  readonly formSvc = inject(FormService);

  handleTextBodyUpdate(e: Event) {
    const target = e.target as HTMLInputElement;
    this.formSvc.setTextBody(target.value);
  }
}
