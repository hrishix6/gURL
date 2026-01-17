import {
	Component,
	type ElementRef,
	HostBinding,
	inject,
	signal,
	viewChild,
} from "@angular/core";
import { LucideAngularModule, Plus } from "lucide-angular";
import { AppDropdown } from "@/common/components";
import { AppService, TabsService } from "@/services";
import { RequestTab } from "./req.tab";
import { TabHeader } from "./req.tab.header";
import { DraftSavePreferenceModal } from "@/modals/draft.save.preference";

@Component({
	selector: "section[appReqTabs]",
	template: `
    <div class="flex items-center relative py-1 px-2">
      <!-- Button to add  new tab -->
      <button class="btn btn-ghost btn-square btn-sm mr-1" (click)="tabsSvc.createFreshTab()">
        <lucide-angular [img]="PlusIcon" class="size-4" />
      </button>
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
          (onCloseTab)="tabsSvc.emitTabCloseEvent(tab.id)"
          (onSelectTab)="tabsSvc.setActiveTab(tab.id)"
        ></div>
        }
      </div>
      <div class="ml-1 relative">
          <!-- Gradient Shadow to indicate scrollable area -->
          <div
          class="pointer-events-none absolute -left-10 top-0 h-full w-10 bg-linear-to-r from-transparent to-bg-base-100/5"
        ></div>
          <app-dropdown
              [activeItem]="appSvc.activeEnvironment()"
              [items]="appSvc.environments()"
              (onItemSelection)="appSvc.setActiveEnvironment($event)"
              [size]="'md'"
              [align]="'end'"
              [direction]="'down'"
              [varient]="'soft'"
              >
          </app-dropdown>
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
	imports: [LucideAngularModule, TabHeader, RequestTab, AppDropdown],
})
export class AppTabsWrapper {
	readonly PlusIcon = Plus;
	readonly tabsSvc = inject(TabsService);
	readonly appSvc = inject(AppService);

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
