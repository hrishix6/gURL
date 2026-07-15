import { NgClass } from "@angular/common";
import { Component, HostBinding, inject } from "@angular/core";
import { SystemIconComponent } from "@/common/components/icon";
import { TooltipDirective } from "@/common/components/tooltip";
import { SUPPORTED_THEMES } from "@/constants";
import { AppService } from "@/services";
import type { AppTheme } from "@/types";

@Component({
	selector: "div[gurl-theme-switcher]",
	template: `
      <div class="dropdown dropdown-top dropdown-end">
        <div tabindex="0" role="button" class="btn btn-square btn-sm" gurlTooltip [tooltip]="'Theme'">
          <i gurl-icon [icon]="'Theme'" [className]="'size-5'" ></i>
        </div>
        <ul
          tabindex="-1"
          class="menu dropdown-content bg-base-100 rounded-box z-50 w-52 p-2 shadow-sm"
        >
           @for (item of supportedThemes; track item.id) {
          <li class="my-0.5">
            <button
              role="link"
              [ngClass]="{ 'menu-active': item.id === appSvc.activeTheme() }"
              (click)="setActiveTheme(item.id)"
            >
              {{ item.label }}
              @if(item.id == appSvc.activeTheme()) {
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
export class GurlThemeSwitcher {
	@HostBinding("class")
	def = "flex items-center justify-center";

	protected readonly supportedThemes = SUPPORTED_THEMES;

	protected readonly appSvc = inject(AppService);

	protected setActiveTheme(id: AppTheme) {
		this.appSvc.setActiveTheme(id);
		const activeEl = document.activeElement as HTMLAnchorElement;
		activeEl?.blur();
	}
}
