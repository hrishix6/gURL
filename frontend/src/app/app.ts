import { Component, HostBinding, inject, OnInit } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { BrowserOpenURL } from '../../wailsjs/runtime';
import { APP_VERSION } from '../constants';
import { AppService, TabsService } from '../services';
import { AppSpinner } from './app.spinner';
import { AppEnvironmentSwitcher } from './env.switcher';
import { DesktopSidebar } from './layout/desktop.sidebar';
import { AppFooter } from './layout/footer';
import { MobileSidebar } from './layout/mobile.sidebar';
import { AppTaskbar } from './layout/taskbar/task.bar';
import { AppTabsWrapper } from './tabs/app.tabs';

@Component({
  selector: 'app',
  template: `
    <!-- hidden checkbox control state of mobile sidebar -->
    <input
      id="app-drawer"
      type="checkbox"
      class="drawer-toggle"
      [checked]="appSvc.isMobileSidebarOpen()"
    />
    <div class="drawer-content">
      <main class="h-screen flex relative">
        @if (appSvc.appState() === "loaded") {
        <section appTaskBar></section>
        @if(appSvc.isDesktopSidebarOpen()){
        <aside appDesktopSidebar></aside>
        }
        <!-- Main view -->
        <main class="flex flex-1 flex-col overflow-hidden">
          <!-- Main header -->
          <header class="flex basis-12 grow-0 shrink-0 items-center p-2">
            <div class="flex-1"></div>
            <div>
              <app-env-switcher></app-env-switcher>
            </div>
          </header>
          <!-- Main content -->
          <section appTabs></section>
          <!-- Main footer -->
          <footer appFooter></footer>
        </main>
        } @else {
        <app-spinner />
        }
      </main>
    </div>
    <!-- This content is rendered inside mobile sidebar -->
    <div class="drawer-side">
      <label class="drawer-overlay" (click)="appSvc.setMobileSidebarState(false)"></label>
      <aside appMobileSidebar></aside>
    </div>
  `,
  imports: [
    LucideAngularModule,
    AppTaskbar,
    AppSpinner,
    AppFooter,
    DesktopSidebar,
    MobileSidebar,
    AppEnvironmentSwitcher,
    AppTabsWrapper,
  ],
})
export class App implements OnInit {
  @HostBinding('class')
  def = 'drawer';

  readonly appVersion = APP_VERSION;

  tabsSvc = inject(TabsService);
  appSvc = inject(AppService);

  async ngOnInit() {
    await this.appSvc.initializeApp();
  }

  handleOpenLink(url: string) {
    BrowserOpenURL(url);
  }
}
