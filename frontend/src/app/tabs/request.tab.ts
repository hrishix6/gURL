import { Component, HostBinding, input } from '@angular/core';
import { FormService } from '../../services';
import { RequestFormDetails } from '../request/req.form.details';
import { ReqFormHeader } from '../request/req.form.header';
import { ResponseDetails } from '../response/res.details';

@Component({
  selector: `app-request-tab`,
  template: `
    <app-req-form-header></app-req-form-header>
    <div class="flex-1 flex flex-col gap-2 overflow-hidden xl:flex-row">
      <app-req-form-details></app-req-form-details>
      <app-res-details></app-res-details>
    </div>
  `,
  imports: [ReqFormHeader, RequestFormDetails, ResponseDetails],
  providers: [FormService],
})
export class RequestTab {
  activeId = input.required<string | null>();
  id = input.required<string>();

  @HostBinding('class') get defaultClass() {
    if (this.activeId() === this.id()) {
      return 'flex-1 p-2 flex flex-col gap-2 overflow-hidden';
    }

    return 'hidden';
  }
}
