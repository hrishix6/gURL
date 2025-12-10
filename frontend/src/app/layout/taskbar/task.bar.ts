import { Component, HostBinding } from '@angular/core';
import { AppSidebarToggle } from './sidebar.toggle';
import { AppThemeSwitcher } from './theme.switcher';

@Component({
  selector: `section[appTaskBar]`,
  template: `
    <header>
      <div appSidebarToggle></div>
    </header>
    <footer class="mt-auto py-2">
      <div appThemeSwithcer></div>
    </footer>
  `,
  imports: [AppSidebarToggle, AppThemeSwitcher],
})
export class AppTaskbar {
  @HostBinding('class')
  def = 'basis-16 grow-0 shrink-0 bg-base-200 flex flex-col items-center py-2 px-1 relative';
}
