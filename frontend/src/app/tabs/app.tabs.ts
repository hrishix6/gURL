import { Component, ElementRef, HostBinding, inject, ViewChild } from '@angular/core';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { TabsService } from '../../services';
import { RequestTab } from './request.tab';
import { TabHeader } from './tab.header';

@Component({
  selector: 'section[appTabs]',
  template: `
    <div class="flex items-center relative px-2">
      <!-- Button to add  new tab -->
      <button class="btn btn-ghost btn-sm mr-1" (click)="tabsSvc.createTab()">
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
        @for (tab of tabsSvc.openReqTabs(); track tab.id) {
        <div
          tabHeader
          [data]="tab"
          [isActive]="tabsSvc.activeReqTab() === tab.id"
          (onCloseTab)="tabsSvc.deleteTab(tab.id)"
          (onSelectTab)="tabsSvc.setActiveTab(tab.id)"
          [disableRemove]="tabsSvc.openTabsCount() === 1"
        ></div>
        }
      </div>
    </div>
    <!-- Tab content view -->
    @for (tab of tabsSvc.openReqTabs(); track tab.id) {
    <app-request-tab [id]="tab.id" [activeId]="tabsSvc.activeReqTab()"> </app-request-tab>
    }
  `,
  imports: [LucideAngularModule, TabHeader, RequestTab],
})
export class AppTabsWrapper {
  readonly PlusIcon = Plus;
  readonly tabsSvc = inject(TabsService);

  @HostBinding('class')
  def = 'flex-1 flex flex-col overflow-hidden border-b border-base-300';

  @ViewChild('tabsContainer') tabContainer: ElementRef<HTMLDivElement> | null = null;

  handleWheel(e: WheelEvent) {
    e.preventDefault();
    this.tabContainer?.nativeElement.scrollBy({
      left: e.deltaY < 0 ? -100 : 100,
      behavior: 'smooth',
    });
  }
}
