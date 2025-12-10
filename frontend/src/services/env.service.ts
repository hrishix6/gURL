import { computed, Injectable, signal } from '@angular/core';
import { DropDownItem } from '../common/components';

@Injectable({
  providedIn: 'root',
})
export class EnvironmentService {
  private _environments = signal<DropDownItem<string>[]>([
    {
      id: 'none',
      displayName: 'None',
    },
  ]);
  private _activeEnvironment = signal<DropDownItem<string>>(this._environments()[0]);

  public environments = computed(() => this._environments());
  public activeEnvironment = computed(() => this._activeEnvironment());

  public setActiveEnvironment(id: string) {
    const index = this._environments().findIndex((x) => x.id === id);
    if (index > -1) {
      this._activeEnvironment.set(this._environments()[index]);
    }
  }
}
