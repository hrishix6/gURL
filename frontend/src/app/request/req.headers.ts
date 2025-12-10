import { Component, HostBinding, inject } from '@angular/core';
import { KeyValFormItem } from '../../common/components/form/key.val.form.item';
import { HID_PLACEHOLDER } from '../../constants';
import { FormService } from '../../services';

@Component({
  selector: 'app-req-headers',
  template: `
    <app-keyval-item
      [placeholderId]="placeHolderHeaderId"
      [items]="formSvc.headers()"
      (onDelete)="formSvc.deleteHeader($event)"
      (onKeyUpdate)="formSvc.updateHeader($event.id, 'key', $event.v)"
      (onValUpdate)="formSvc.updateHeader($event.id, 'val', $event.v)"
      (onBlur)="formSvc.addHeader()"
      (onEnabledUpdate)="formSvc.updateHeader($event.id, 'enabled', $event.v)"
    >
    </app-keyval-item>
  `,
  imports: [KeyValFormItem],
})
export class ReqHeaders {
  @HostBinding('class')
  defaultClass = 'flex-1 p-2 overflow-y-auto';

  readonly placeHolderHeaderId = HID_PLACEHOLDER;
  readonly formSvc = inject(FormService);
}
