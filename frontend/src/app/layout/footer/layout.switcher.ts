import { NgClass } from "@angular/common";
import { Component, computed, inject } from "@angular/core";
import {
	Check,
	Columns2,
	LucideAngularModule,
	MonitorSmartphone,
	Rows2,
} from "lucide-angular";
import { SUPPORTED_LAYOUTS } from "@/constants";
import { AppService } from "@/services";
import { FormLayout } from "@/types";

@Component({
	selector: "div[appLayoutSwitcher]",
	template: `
      <div class="dropdown dropdown-top dropdown-end">
        <div tabindex="0" role="button" class="btn btn-sm btn-square btn-ghost">
             <lucide-angular [img]="layoutSwithcerIcon()" class="size-5"/>
        </div>
        <ul
          tabindex="-1"
          class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
        >
          @for(layout of layouts; track layout) {
             <li class="my-0.5">
                <button
                role="link"
                [ngClass]="{ 'menu-active': layout.id === appSvc.formLayout() }"
                (click)="handleLayoutChange(layout.id)"
                >
                {{layout.displayName}}
                @if(layout.id == appSvc.formLayout()) {
                    <lucide-angular [img]="CheckedIcon" class="size-4  ml-auto" />
                 }
                </button>
            </li>
          }
        </ul>
      </div>
  `,
	imports: [LucideAngularModule, NgClass],
})
export class AppLayoutSwitcher {
	readonly CheckedIcon = Check;

	readonly layouts = SUPPORTED_LAYOUTS;

	handleLayoutChange(layout: FormLayout) {
		this.appSvc.setLayout(layout);
		const target = document.activeElement as HTMLButtonElement;
		target.blur();
	}

	layoutSwithcerIcon = computed(() => {
		console.log(this.appSvc.formLayout());

		switch (this.appSvc.formLayout()) {
			case FormLayout.Horizontal:
				return Rows2;
			case FormLayout.Vertical:
				return Columns2;
			case FormLayout.Responsive:
				return MonitorSmartphone;
		}
	});

	appSvc = inject(AppService);
}
