import { computed, Injectable, signal } from '@angular/core';
import { nanoid } from 'nanoid';
import { RequestTabItem } from '../app/models';

@Injectable({
  providedIn: 'root',
})
export class TabsService {
  private _openTabs = signal<RequestTabItem[]>([]);
  private _activeReqTab = signal<string | null>('');
  public openReqTabs = computed(() => this._openTabs());
  public activeReqTab = computed(() => this._activeReqTab());
  public openTabsCount = computed(() => this._openTabs().length);

  public createTab() {
    //create new tab and set it as active
    const newTab: RequestTabItem = {
      id: nanoid(),
      method: 'GET',
      title: 'New Request',
    };

    this._openTabs.update((prev) => [...prev, newTab]);
    this._activeReqTab.set(newTab.id);
  }

  public deleteTab(id: string) {
    this._openTabs.update((prev) => {
      const i = prev.findIndex((x) => x.id === id);
      if (i === -1) {
        return prev;
      }

      if (this._activeReqTab() === id) {
        const nextTab = prev[i + 1];
        const prevTab = prev[i - 1];
        const newTabId = nextTab?.id || prevTab?.id || null;
        this._activeReqTab.set(newTabId);
      }
      const copy = prev.filter((x) => x.id !== id);
      return copy;
    });
  }

  public setActiveTab(id: string) {
    const i = this._openTabs().findIndex((x) => x.id === id);
    if (i >= 0) {
      this._activeReqTab.set(id);
    }
  }

  constructor() {
    if (this._openTabs().length === 0) {
      this.createTab();
    }
  }
}
