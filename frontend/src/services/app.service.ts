import { computed, effect, Injectable, signal } from '@angular/core';
import { AppState, AppTheme } from '../app/models';
import { DEFAULT_THEME, DESKTOP_SIDEBAR_KEY, SUPPORTED_THEMES, THEME_KEY } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private _appState = signal<AppState>('initializing');
  public appState = computed(() => this._appState());

  //#region theme
  private _activeTheme = signal<AppTheme | null>(null);
  public activeTheme = computed(() => this._activeTheme());
  public setActiveTheme(theme: AppTheme) {
    this._activeTheme.set(theme);
  }
  public initializeTheme() {
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    if (savedTheme && SUPPORTED_THEMES.some((x) => x.id === savedTheme)) {
      this._activeTheme.set(savedTheme as AppTheme);
    } else {
      this._activeTheme.set(DEFAULT_THEME);
    }
  }
  //#endregion theme

  //#region desktop-sidebar
  private _isDesktopSidebarOpen = signal<boolean | null>(null);
  public isDesktopSidebarOpen = computed(() => this._isDesktopSidebarOpen());

  public toggleDesktopSidebar() {
    this._isDesktopSidebarOpen.update((x) => !x);
  }
  //#endregion desktop-sidebar

  //#region mobile-sidebar
  private _isMobileSidebarOpen = signal<boolean>(false);
  public isMobileSidebarOpen = computed(() => this._isMobileSidebarOpen());
  public setMobileSidebarState(isOpen: boolean) {
    this._isMobileSidebarOpen.set(isOpen);
  }
  public initializeSidebar() {
    const savedState = window.localStorage.getItem(DESKTOP_SIDEBAR_KEY);
    if (savedState && ['open', 'closed'].includes(savedState)) {
      this._isDesktopSidebarOpen.set(savedState === 'open');
    } else {
      this._isDesktopSidebarOpen.set(true);
    }
  }

  //#endregion mobile-sidebar

  constructor() {
    effect(() => {
      const newTheme = this._activeTheme();
      if (newTheme) {
        document.documentElement.dataset['theme'] = newTheme;
        window.localStorage.setItem(THEME_KEY, newTheme);
      }
    });

    effect(() => {
      const currentState = this._isDesktopSidebarOpen();
      if (currentState !== null) {
        const desktopsidebarState = this._isDesktopSidebarOpen() ? 'open' : 'closed';
        window.localStorage.setItem(DESKTOP_SIDEBAR_KEY, desktopsidebarState);
      }
    });
  }

  public async initializeApp() {
    try {
      this.initializeTheme();
      this.initializeSidebar();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this._appState.set('loaded');
    } catch (error) {
      this._appState.set('error');
    }
  }
}
