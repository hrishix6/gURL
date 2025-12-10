import { Component, HostBinding, inject, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Switcher } from '../common/components';
import { EnvironmentService } from '../services';

@Component({
  selector: `app-env-switcher`,
  template: `
    <details
      appDropDown
      [activeItem]="envSvc.activeEnvironment()"
      [align]="'end'"
      [direction]="'down'"
      [fixed]="true"
      [size]="'md'"
      [items]="envSvc.environments()"
      [isOpen]="isOpen()"
      (onItemSelection)="handleActiveItemSelection($event)"
      (onToggleDropdown)="handleDropwnToggle()"
    ></details>
  `,
  imports: [LucideAngularModule, Switcher],
})
export class AppEnvironmentSwitcher {
  @HostBinding('class')
  envSvc = inject(EnvironmentService);

  isOpen = signal<boolean>(false);

  handleDropwnToggle() {
    this.isOpen.update((prev) => !prev);
  }

  handleActiveItemSelection(id: string) {
    this.envSvc.setActiveEnvironment(id);
    this.handleDropwnToggle();
  }
}
