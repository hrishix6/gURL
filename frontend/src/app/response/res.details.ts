import { Component, HostBinding, inject } from '@angular/core';
import { Ban, Download, LucideAngularModule, ShieldBanIcon, X } from 'lucide-angular';
import { Tab } from '../../common/components/tab/tab';
import { RES_DETAILS_TABS } from '../../constants';
import { FormService } from '../../services';
import { ResTabId } from '../models';
import { ResStats } from './res.stats';

@Component({
  selector: 'app-res-details',
  template: `
    <header class="flex justify-between items-center">
      <app-tab
        [defaultActive]="formSvc.activeResTab()"
        (onActiveChange)="handleTabChange($event)"
        [tabs]="resDetailsTabs"
        [activeTab]="formSvc.activeResTab()"
      ></app-tab>
      @if(formSvc.resStats()){
      <app-res-stats [stats]="formSvc.resStats()"></app-res-stats>
      }
    </header>
    <div class="flex-1 overflow-y-auto relative">
      @switch (formSvc.activeResTab()) { @case ("res_headers") { @if (formSvc.resHeaders().length) {
      <div class="overflow-x-auto bg-base-100">
        <table class="table table-fixed">
          <!-- head -->
          <thead>
            <tr>
              <th class="w-2/5">Name</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            @for (item of formSvc.resHeaders(); track item.key) {
            <tr>
              <td>
                {{ item.key || '' }}
              </td>
              <td>
                {{ item.value || '' }}
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>
      } @else {
      <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-25">
        <lucide-angular [img]="NoneIcon" class="size-16 -z-10" />
      </div>
      } } @case ("res_body"){ @if(formSvc.isReqInProgress()){
      <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <div class="flex flex-col items-center">
          <lucide-angular [img]="LoaderIcon" class="size-16 animate-bounce" />
          <button class="btn btn-soft btn-primary btn-lg" (click)="formSvc.cancel()">Abort</button>
        </div>
      </div>
      } @else { @if(formSvc.isReqAborted()){
      <div
        class="absolute top-0 left-0 w-full h-full flex items-center text-error justify-center opacity-25"
      >
        <div class="flex flex-col gap-2">
          <lucide-angular [img]="AbortedIcon" class="size-16 -z-10" />
        </div>
      </div>
      } @else { } } } @case('res_console') {
      <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-25">
        <span>Coming Soon</span>
      </div>
      } }
    </div>
  `,
  imports: [Tab, LucideAngularModule, ResStats],
})
export class ResponseDetails {
  readonly CancelIcon = X;
  readonly NoneIcon = Ban;
  readonly AbortedIcon = ShieldBanIcon;
  readonly LoaderIcon = Download;
  readonly formSvc = inject(FormService);
  readonly resDetailsTabs = RES_DETAILS_TABS;

  @HostBinding('class')
  hostClass = 'flex-1 flex flex-col gap-2 overflow-hidden';

  handleTabChange(id: ResTabId) {
    this.formSvc.setActiveResTab(id);
  }
}
