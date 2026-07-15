import { NgClass } from "@angular/common";
import { Component, inject } from "@angular/core";
import { SystemIconComponent } from "@/common/components/icon";
import { TooltipDirective } from "@/common/components/tooltip";
import { SUPPORTED_LAYOUTS } from "@/constants";
import { AppService } from "@/services";
import type { FormLayout } from "@/types";

@Component({
	selector: "div[gurl-layout-switcher]",
	template: `
      <div class="dropdown dropdown-top dropdown-end">
        <div tabindex="0" role="button" class="btn btn-square btn-sm" gurlTooltip [tooltip]="'Layout'">
             @switch (appSvc.formLayout()) {
				@case("r") {
					 <i gurl-icon [icon]="'ResponsiveLayout'" [className]="'size-5'" ></i>
				}
				@case("h") {
					 <i gurl-icon [icon]="'HorizontalLayout'" [className]="'size-5'" ></i>
				}
				@case("v"){
					 <i gurl-icon [icon]="'VerticleLayout'" [className]="'size-5'" ></i>
				}
			 }
        </div>
        <ul
          tabindex="-1"
          class="menu dropdown-content bg-base-100 rounded-box z-50 w-52 p-2 shadow-sm"
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
                   <i gurl-icon [icon]="'Tick'" [className]="'size-4 ml-auto'" ></i>
                 }
                </button>
            </li>
          }
        </ul>
      </div>
  `,
	imports: [NgClass, SystemIconComponent, TooltipDirective],
})
export class GurlLayoutSwitcher {
	protected readonly layouts = SUPPORTED_LAYOUTS;
	protected readonly appSvc = inject(AppService);

	protected handleLayoutChange(layout: FormLayout) {
		this.appSvc.setLayout(layout);
		const target = document.activeElement as HTMLButtonElement;
		target.blur();
	}
}
