import { Component, HostBinding, inject } from '@angular/core';
import { KeyValFormItem } from '../../common/components/form/key.val.form.item';
import { QID_PLACEHOLDER } from '../../constants';
import { FormService } from '../../services';

@Component({
  selector: 'app-req-query',
  template: `
    <app-keyval-item
      [placeholderId]="placeHolderQueryId"
      [items]="formSvc.queryParams()"
      (onDelete)="formSvc.deleteQueryParam($event)"
      (onKeyUpdate)="formSvc.updateQueryParam($event.id, 'key', $event.v)"
      (onValUpdate)="formSvc.updateQueryParam($event.id, 'val', $event.v)"
      (onBlur)="formSvc.addQueryParam()"
    >
    </app-keyval-item>
  `,
  imports: [KeyValFormItem],
})
export class ReqQuery {
  @HostBinding('class')
  defaultClass = 'flex-1 p-2 overflow-y-auto';

  readonly placeHolderQueryId = QID_PLACEHOLDER;
  readonly formSvc = inject(FormService);
}
