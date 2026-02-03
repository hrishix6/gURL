import {
	Component,
	HostBinding,
	HostListener,
	inject,
	input,
	output,
} from "@angular/core";
import { Container, LucideAngularModule, X } from "lucide-angular";
import { ReqMethodTag } from "@/request/method.tag";
import { TabsService } from "@/services";
import type { ApplicationTab } from "@/types";

@Component({
	selector: `div[gurl-tab-header]`,
	template: `
    <div class="flex flex-1 items-center gap-1.5 overflow-hidden">
	   @switch (data().entityType) {
		   	@case("req") {
				<div gurl-req-tag  [size]="'xs'" [method]="data().tag"></div>
			}
			@case("env") {
				<lucide-angular [img]="EnvironmentIcon" class="size-4" />
			}
	    }
	  	@if(data().isModified) {
			<div aria-label="status" class="status status-md status-primary"></div>
		}	
      <p class="truncate">
        {{ data().name }}
      </p>
    </div>
	<button
		class="btn btn-ghost btn-square btn-xs hover:bg-base-200"
		(click)="handleClose($event)"
		[disabled]="tabSvc.tabCount() === 1"
		>
		<lucide-angular [img]="CancelIcon" class="size-3" />
	</button>
	@if(isActive()){
		<div class="absolute top-0 left-0 w-full h-0.5 bg-primary/75"></div>
	}
  `,
	imports: [LucideAngularModule, ReqMethodTag],
})
export class TabHeader {
	@HostBinding("class") get def() {
		const defaults = [
			"flex",
			"p-2",
			"justify-between",
			"hover:cursor-pointer",
			"hover:bg-base-100",
			"rounded-box",
			"items-center",
			"basis-56",
			"grow-0",
			"shrink-0",
			"overflow-hidden",
			"text-sm",
			"relative",
			"shadow-md",
		];

		if (this.isActive()) {
			return [...defaults, "bg-base-100"].join(" ");
		}

		return [...defaults, "bg-base-300", "opacity-65"].join(" ");
	}

	@HostListener("mousedown", ["$event"])
	handleClick(e: MouseEvent) {
		e.stopPropagation();
		if (e.buttons === 4 || e.button === 1) {
			this.onCloseTab.emit();
		}
	}

	@HostListener("click", ["$event"])
	handleActivation(e: Event) {
		e.stopPropagation();
		this.onSelectTab.emit();
	}

	isActive = input.required<boolean>();
	data = input.required<ApplicationTab>();
	onCloseTab = output();
	onSelectTab = output();

	protected readonly tabSvc = inject(TabsService);
	protected readonly CancelIcon = X;
	protected readonly EnvironmentIcon = Container;

	protected handleClose(e: Event) {
		e.stopPropagation();
		this.onCloseTab.emit();
	}
}
