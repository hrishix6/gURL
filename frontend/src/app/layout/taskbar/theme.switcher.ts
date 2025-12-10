import { NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Check, LucideAngularModule, Palette } from 'lucide-angular';
import { SUPPORTED_THEMES } from '../../../constants';
import { AppService } from '../../../services';
import { AppTheme } from '../../models';

@Component({
  selector: 'div[appThemeSwithcer]',
  template: `
    <details
      class="dropdown dropdown-right dropdown-end"
      [attr.open]="this.isThemeSwitcherOpen() ? '' : null"
    >
      <summary class="btn btn-ghost btn-primary btn-sm" (click)="toggleThemeSwitcher()">
        <lucide-angular [img]="ThemeSwitcherIcon" class="size-5" />
      </summary>
      <ul class="menu dropdown-content bg-base-300 rounded-box z-1 w-52 p-2 shadow-sm">
        @for (item of supportedThemes; track item.id) {
        <li class="my-0.5">
          <a
            [ngClass]="{ 'menu-active': appSvc.activeTheme() === item.id }"
            (click)="setActiveTheme(item.id)"
          >
            {{ item.label }}
            @if(item.id === appSvc.activeTheme()) {
            <lucide-angular [img]="CheckedIcon" class="size-4  ml-auto" />
            }
          </a>
        </li>
        }
      </ul>
    </details>
  `,
  imports: [LucideAngularModule, NgClass],
})
export class AppThemeSwitcher {
  readonly CheckedIcon = Check;
  readonly ThemeSwitcherIcon = Palette;
  readonly supportedThemes = SUPPORTED_THEMES;

  isThemeSwitcherOpen = signal<boolean>(false);
  appSvc = inject(AppService);

  setActiveTheme(id: AppTheme) {
    this.appSvc.setActiveTheme(id);
    this.toggleThemeSwitcher();
  }

  toggleThemeSwitcher() {
    this.isThemeSwitcherOpen.update((x) => !x);
  }
}
