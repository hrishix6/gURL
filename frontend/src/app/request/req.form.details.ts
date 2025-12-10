import { Component, HostBinding, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Tab } from '../../common/components/tab/tab';
import { REQ_DETAILS_TABS } from '../../constants';
import { FormService } from '../../services';
import { ReqTabId } from '../models';
import { ReqBody } from './req.body';
import { ReqHeaders } from './req.headers';
import { ReqQuery } from './req.query';

@Component({
  selector: 'app-req-form-details',
  template: `
    <header>
      <app-tab
        [defaultActive]="formSvc.activeReqTab()"
        (onActiveChange)="handleTabChange($event)"
        [tabs]="reqDetailsTabs"
        [activeTab]="formSvc.activeReqTab()"
      ></app-tab>
    </header>
    <div class="flex-1 flex flex-col gap-2 overflow-hidden mt-2">
      @switch (formSvc.activeReqTab()) { @case ("req_headers") {
      <app-req-headers />
      } @case ("req_query") {
      <app-req-query />
      } @case ("req_body") {
      <app-req-body />
      } @case ("req_auth") {
      <div class="flex-1 relative">
        <div
          class="absolute top-0 left-0 h-full w-full flex items-center justify-center opacity-25"
        >
          <span>Coming soon</span>
        </div>
      </div>
      } }
    </div>
  `,
  imports: [Tab, ReqBody, ReqHeaders, ReqQuery, LucideAngularModule],
})
export class RequestFormDetails {
  @HostBinding('class')
  hostClass =
    'flex-1 flex flex-col overflow-hidden border-b pb-2 border-primary xl:border-r xl:border-b-0 ';

  readonly formSvc = inject(FormService);
  readonly reqDetailsTabs = REQ_DETAILS_TABS;

  handleTabChange(id: ReqTabId) {
    this.formSvc.setActiveReqTab(id);
  }
}
