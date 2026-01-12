import { NgClass } from "@angular/common";
import { Component, HostBinding, inject } from "@angular/core";
import { Check, LucideAngularModule, Palette } from "lucide-angular";
import { SUPPORTED_THEMES } from "@/constants";
import { AppService } from "@/services";
import type { AppTheme } from "@/types";

@Component({
	selector: "div[appThemeSwithcer]",
	template: `
      <div class="dropdown dropdown-top dropdown-end">
        <div tabindex="0" role="button" class="btn btn-sm btn-square btn-ghost">
          <lucide-angular [img]="ThemeSwitcherIcon" class="size-5" />
        </div>
        <ul
          tabindex="-1"
          class="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
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
export class AppThemeSwitcher {
	readonly CheckedIcon = Check;
	readonly ThemeSwitcherIcon = Palette;
	readonly supportedThemes = SUPPORTED_THEMES;

	appSvc = inject(AppService);

	setActiveTheme(id: AppTheme) {
		this.appSvc.setActiveTheme(id);
		const activeEl = document.activeElement as HTMLAnchorElement;
		activeEl?.blur();
	}

	@HostBinding("class")
	def = "flex items-center justify-center";
}
