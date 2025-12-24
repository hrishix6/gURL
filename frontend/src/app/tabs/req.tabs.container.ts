import {
	Component,
	type ElementRef,
	HostBinding,
	inject,
	viewChild,
} from "@angular/core";
import { LucideAngularModule, Plus } from "lucide-angular";
import { TabsService } from "../services";
import { RequestTab } from "./req.tab";
import { TabHeader } from "./req.tab.header";

@Component({
	selector: "section[appReqTabs]",
	template: `
    <div class="flex items-center relative px-2">
      <!-- Button to add  new tab -->
      <button class="btn btn-ghost btn-square btn-sm mr-1" (click)="tabsSvc.createFreshTab()">
        <lucide-angular [img]="PlusIcon" class="size-4" />
      </button>
      <!-- Gradient Shadow to indicate scrollable area -->
      <div
        class="pointer-events-none absolute right-0 top-0 h-full w-10 bg-linear-to-r from-transparent to-base-100"
      ></div>
      <!-- Tabs -->
      <div
        class="flex flex-1 gap-0.5 overflow-x-auto no-scrollbar whitespace-nowrap"
        #tabsContainer
        (wheel)="handleWheel($event)"
      >
        @for (tab of tabsSvc.openTabs(); track tab.id) {
        <div
          appReqTabHeader
          [data]="tab"
          [isActive]="tabsSvc.activeTab() === tab.id"
          (onCloseTab)="tabsSvc.deleteTab(tab.id)"
          (onSelectTab)="tabsSvc.setActiveTab(tab.id)"
        ></div>
        }
      </div>
    </div>
    <!-- Tab content view -->
    @for (tab of tabsSvc.openTabs(); track tab.id) { @switch (tab.entityType) { @case ("req") {
    <app-request-tab
      [tabId]="tab.id"
      [draftId]="tab.entityId"
      [activeId]="tabsSvc.activeTab()"
    ></app-request-tab>
    } } }
  `,
	imports: [LucideAngularModule, TabHeader, RequestTab],
})
export class AppTabsWrapper {
	readonly PlusIcon = Plus;
	readonly tabsSvc = inject(TabsService);

	@HostBinding("class")
	def = "flex-1 flex flex-col overflow-hidden";

	tabContainer =
		viewChild.required<ElementRef<HTMLDivElement>>("tabsContainer");

	handleWheel(e: WheelEvent) {
		e.preventDefault();
		this.tabContainer().nativeElement.scrollBy({
			left: e.deltaY < 0 ? -100 : 100,
			behavior: "smooth",
		});
	}
}
