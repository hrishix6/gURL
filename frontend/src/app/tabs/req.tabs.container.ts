import {
	Component,
	type ElementRef,
	HostBinding,
	inject,
	viewChild,
} from "@angular/core";
import { LucideAngularModule, Plus } from "lucide-angular";
import { EnvironmentTab } from "@/environments/environment.tab";
import { AppService, TabsService } from "@/services";
import { RequestTab } from "../request/req.tab";
import { TabHeader } from "./req.tab.header";

@Component({
	selector: "section[appReqTabs]",
	template: `
    <div class="flex items-center py-1 px-2 border-b-2 border-base-100">
      <!-- Button to add  new tab -->
      <button class="btn btn-square btn-ghost mr-1" (click)="tabsSvc.createFreshTab()">
        <lucide-angular [img]="PlusIcon" class="size-4" />
      </button>
      <!-- Tabs -->
      <div
        class="flex flex-1 gap-0.5 overflow-x-auto no-scrollbar whitespace-nowrap relative"
        #tabsContainer
        (wheel)="handleWheel($event)"
      >
        @for (tab of tabsSvc.openTabs(); track tab.id) {
        <div
          gurl-tab-header
          [data]="tab"
          [isActive]="tabsSvc.activeTab() === tab.id"
          (onCloseTab)="tabsSvc.emitTabCloseEvent(tab.id)"
          (onSelectTab)="tabsSvc.setActiveTab(tab.id)"
        ></div>
        }
      </div>
    </div>
    <!-- Tab content view -->
    @for (tab of tabsSvc.openTabs(); track tab.id) {
      @if(['req', 'req_example'].includes(tab.entityType)) {
        <gurl-req-tab
                [tab]="tab"
                [activeId]="tabsSvc.activeTab()"
        />
      }
      @if(tab.entityType === 'env') {
        <gurl-env-tab
        [tab]="tab"
        [activeId]="tabsSvc.activeTab()"
        >
        </gurl-env-tab>
      }
    } 
  `,
	imports: [LucideAngularModule, TabHeader, RequestTab, EnvironmentTab],
})
export class TabsWrapper {
	@HostBinding("class")
	def = "flex-1 flex flex-col overflow-hidden";

	protected readonly PlusIcon = Plus;
	protected readonly tabsSvc = inject(TabsService);
	protected readonly appSvc = inject(AppService);

	private readonly tabContainer =
		viewChild.required<ElementRef<HTMLDivElement>>("tabsContainer");

	protected handleWheel(e: WheelEvent) {
		e.preventDefault();
		this.tabContainer().nativeElement.scrollBy({
			left: e.deltaY < 0 ? -100 : 100,
			behavior: "smooth",
		});
	}
}
