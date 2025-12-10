import { Component, inject, signal } from '@angular/core';
import { ChevronDown, ChevronUp, LucideAngularModule } from 'lucide-angular';
import { Switcher } from '../../common/components';
import { REQ_METHODS } from '../../constants';
import { FormService } from '../../services';
import { RequestMethod } from '../models';

@Component({
  selector: `app-req-method-switcher`,
  template: `
    <details
      appDropDown
      [align]="'start'"
      [direction]="'down'"
      [items]="reqMethods"
      [openIcon]="DropdownOpenIcon"
      [closedIcon]="DropdownCloseIcon"
      [activeItem]="this.formSvc.method()"
      (onItemSelection)="handleActiveItemSelection($event)"
      [isOpen]="isOpen()"
      (onToggleDropdown)="handleDropwnToggle()"
    ></details>
  `,
  imports: [LucideAngularModule, Switcher],
})
export class RequestMethodSwitcher {
  readonly DropdownOpenIcon = ChevronDown;
  readonly DropdownCloseIcon = ChevronUp;
  readonly reqMethods = REQ_METHODS;

  formSvc = inject(FormService);

  isOpen = signal<boolean>(false);

  handleDropwnToggle() {
    this.isOpen.update((prev) => !prev);
  }

  handleActiveItemSelection(id: RequestMethod) {
    this.formSvc.setSelectedMethod(id);
    this.handleDropwnToggle();
  }
}
