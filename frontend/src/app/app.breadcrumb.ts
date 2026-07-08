import { Component, HostBinding, inject } from "@angular/core";
import { TabsService } from "@/services";
import { SystemIconComponent } from "./common/components/icon";

@Component({
	selector: "div[gurl-breadcrumbs]",
	template: `
        @if (tabSvc.crumbs().length > 0) {
            <ul class="flex items-center gap-2">
                @for (crumb of tabSvc.crumbs(); track $index) {
                    <li class="text-sm">
                        <a class="flex items-center gap-2 hover:decoration-0 hover:cursor-default">
                            @switch (crumb.type) {
								@case ("MockServer") {
									 <i gurl-icon
									 [className]="'size-4'"
									 [icon]="'MockServer'"
									 >
									</i>
                                }
                                @case ("Collection") {
									 <i gurl-icon
									 [className]="'size-4'"
									 [icon]="'Collection'"
									 >
									</i>
                                }
                                @case ("Environment") {
                                    
									 <i gurl-icon
									 [className]="'size-4'"
									 [icon]="'Environment'"
									 >
									</i>
                                }
                                @case ("Request") {
                                    
									  <i gurl-icon
									 [className]="'size-4'"
									 [icon]="'Request'"
									 >
									 </i>
                                }
								@case ("Request_Example") {
									
									  <i gurl-icon
									 [className]="'size-4'"
									 [icon]="'RequestExample'"
									 >
									 </i>
								}

								@case ("Mock") {
									 <i gurl-icon
									 [className]="'size-4'"
									 [icon]="'Mock'"
									 >
									</i>
                                }
                            }
                            <p class="font-semibold">{{crumb.name}}</p>
                        </a>
                    </li>
					@if($index < (tabSvc.crumbs().length - 1)){
						   <i gurl-icon
									 [className]="'size-4 text-base-content/50'"
									 [icon]="'ChevronRight'"
									 >
							</i>
					}
                }
            </ul>
        }
    `,
	imports: [SystemIconComponent],
})
export class Breadcrumbs {
	@HostBinding("class")
	readonly hostClass = "overflow-x-auto whitespace-nowrap";

	protected readonly tabSvc = inject(TabsService);
}
