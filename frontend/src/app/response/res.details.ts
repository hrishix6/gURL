import { Component, HostBinding, inject } from "@angular/core";
import {
	Ban,
	Download,
	File,
	LucideAngularModule,
	MessageCircleWarning,
	Save,
	ShieldBanIcon,
	X,
} from "lucide-angular";
import { Tab } from "../common/components";
import { RES_DETAILS_TABS } from "../../constants";
import { FormService } from "../services";
import type { ResTabId } from "../../types";
import { ResOptions } from "./res.options";
import { ResStats } from "./res.stats";

@Component({
	selector: "app-res-details",
	template: `
    <header class="flex justify-between items-center">
      <app-section-tab
        [defaultActive]="formSvc.activeResTab()"
        (onActiveChange)="handleTabChange($event)"
        [tabs]="resDetailsTabs"
        [activeTab]="formSvc.activeResTab()"
      ></app-section-tab>

      @if(formSvc.resStats()){
      <div class="flex items-center gap-2">
        <app-res-opts />
        <app-res-stats [stats]="formSvc.resStats()"></app-res-stats>
      </div>
      }
    </header>
    <div class="flex-1 overflow-y-auto relative p-2">
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
      <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
        <lucide-angular [img]="NoneIcon" class="size-16 -z-10" />
      </div>
      } } @case ("res_body"){ @switch (formSvc.reqState()) { @case ("idle") {
      <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
        <lucide-angular [img]="NoneIcon" class="size-16 -z-10" />
      </div>
      } @case ("aborted") {
      <div
        class="absolute top-0 left-0 w-full h-full flex items-center text-error justify-center opacity-10"
      >
        <div class="flex flex-col gap-2">
          <lucide-angular [img]="AbortedIcon" class="size-16 -z-10" />
        </div>
      </div>
      } @case ("error") {
      <div
        class="absolute top-0 left-0 w-full h-full flex items-center text-error justify-center opacity-10"
      >
        <div class="flex flex-col gap-2">
          <lucide-angular [img]="ErroredReqIcon" class="size-16 -z-10" />
        </div>
      </div>
      } @case ("success") { @if(formSvc.responseBody()?.isText){
      <textarea
        class="textarea textarea-ghost textarea-primary bg-base-300 xl:textarea-lg w-full h-full"
        readonly
        [value]="formSvc.responseBody()?.textContent"
      >
      </textarea>
      }@else {
      <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        @if(formSvc.resStats()?.size) {
        <div class="flex flex-col gap-2">
          <lucide-angular [img]="FileIcon" class="size-16 -z-10" />
          <p class="text-xl">{{ formSvc.responseBody()?.extension }} File</p>
        </div>
        }@else {
        <span>No Body</span>
        }
      </div>
      } } @case ("progress") {
      <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center">
        <div class="flex flex-col gap-2 items-center">
          <span class="loading loading-ring text-primary loading-sm xl:loading-lg"></span>
          <button class="btn btn-soft btn-primary btn-lg" (click)="formSvc.cancel()">Abort</button>
        </div>
      </div>
      } } } @case('res_console') {
      <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
        <span>Coming Soon</span>
      </div>
      } }
    </div>
  `,
	imports: [Tab, LucideAngularModule, ResStats, ResOptions],
})
export class ResponseDetails {
	readonly CancelIcon = X;
	readonly NoneIcon = Ban;
	readonly AbortedIcon = ShieldBanIcon;
	readonly ErroredReqIcon = MessageCircleWarning;
	readonly SaveIcon = Save;
	readonly LoaderIcon = Download;
	readonly formSvc = inject(FormService);
	readonly resDetailsTabs = RES_DETAILS_TABS;
	readonly FileIcon = File;

	@HostBinding("class")
	hostClass = "flex-1 flex flex-col gap-2 px-2 overflow-hidden";

	handleTabChange(id: ResTabId) {
		this.formSvc.setActiveResTab(id);
	}
}
