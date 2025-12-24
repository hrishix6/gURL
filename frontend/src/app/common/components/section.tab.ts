import { NgClass } from "@angular/common";
import { Component, input, output } from "@angular/core";
import type { TabItem } from "../../../types";

@Component({
	selector: "app-section-tab",
	template: `
    <div role="tablist" class="tabs tabs-sm tabs-border xl:tabs-md">
      @for (tabItem of tabs(); track tabItem.id) {
      <a
        role="tab"
        (click)="handleClick(tabItem.id)"
        [ngClass]="{
          tab: true,
          'tab-active': tabItem.id === activeTab(),
          indicator: !!tabItem.hasIndicator
        }"
      >
        {{ tabItem.Name }}
        @if(tabItem.indicatorVal){
        <span class="mx-1">({{ tabItem.indicatorVal }})</span>
        }
      </a>
      }
    </div>
  `,
	imports: [NgClass],
})
export class Tab<T extends string> {
	defaultActive = input.required<T>();
	activeTab = input.required<T>();
	onActiveChange = output<T>();
	tabs = input.required<readonly TabItem<T>[]>();

	handleClick(id: T) {
		this.onActiveChange.emit(id);
	}
}
