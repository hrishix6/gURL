import { NgClass } from "@angular/common";
import { Component, HostBinding, inject } from "@angular/core";
import {
	Container,
	History,
	Layers,
	LucideAngularModule,
} from "lucide-angular";
import { AppService } from "@/services";
import { AppSidebarContent } from "@/types";

@Component({
	selector: "gurl-req-sidebar-tabs",
	template: `
            <a role="tab" [ngClass]="{
                'tab flex rounded-box flex-1 relative': true,
                'tab-active': appSvc.appSidebarContent() === 'collections'
            }" (click)="handleSidebarTabSelection('c')">
                <lucide-angular [img]="CollectionIcon" class="size-4 mr-1" ></lucide-angular>
                Collections
				@if(appSvc.appSidebarContent() === 'collections'){
					<div class="absolute top-0 left-0 w-full h-0.5 bg-primary/75"></div>
				}
            </a>
            
            <a role="tab" [ngClass]="{
                'tab flex rounded-box flex-1 relative': true,
                'tab-active': appSvc.appSidebarContent() === 'environments'
            }"  (click)="handleSidebarTabSelection('e')">
                <lucide-angular [img]="EnvironmentIcon" class="size-4 mr-1" ></lucide-angular>
               Environments
			   @if(appSvc.appSidebarContent() === 'environments'){
					<div class="absolute top-0 left-0 w-full h-0.5 bg-primary/75"></div>
				}
            </a>
            <a role="tab" [ngClass]="{
                'tab flex rounded-box flex-1 relative': true,
                'tab-active': appSvc.appSidebarContent() === 'history'
            }"   (click)="handleSidebarTabSelection('h')">
             <lucide-angular [img]="HistoryIcon" class="size-4 mr-1"></lucide-angular>
               History
			   @if(appSvc.appSidebarContent() === 'history'){
					<div class="absolute top-0 left-0 w-full h-0.5 bg-primary/75"></div>
				}
            </a>
  `,
	imports: [NgClass, LucideAngularModule],
})
export class GurlReqSidebarTabs {
	@HostBinding("class")
	readonly hostClass = "tabs tabs-box flex-1 flex text-sm";

	@HostBinding("attr.role")
	readonly hostRole = "tablist";

	protected readonly CollectionIcon = Layers;
	protected readonly EnvironmentIcon = Container;
	protected readonly HistoryIcon = History;

	protected readonly appSvc = inject(AppService);

	protected handleSidebarTabSelection(content: string) {
		switch (content) {
			case "c":
				this.appSvc.setCurrentSidebarContent(AppSidebarContent.Collections);
				break;
			case "e":
				this.appSvc.setCurrentSidebarContent(AppSidebarContent.Environments);
				break;
			case "h":
				this.appSvc.setCurrentSidebarContent(AppSidebarContent.History);
				break;
		}
	}
}
