import { Component, HostBinding, inject, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Switcher } from '../../common/components/dropdown/switcher';
import { REQ_BODY_TYPES } from '../../constants';
import { FormService } from '../../services';
import { ReqBodyType } from '../models';

@Component({
  selector: `app-req-body-switcher`,
  template: `
    <details
      appDropDown
      [align]="'end'"
      [direction]="'up'"
      [fixed]="true"
      [size]="'md'"
      [items]="reqBodyTypes"
      [activeItem]="this.formSvc.bodyType()"
      (onItemSelection)="handleActiveItemSelection($event)"
      [isOpen]="isOpen()"
      (onToggleDropdown)="handleDropwnToggle()"
    ></details>
  `,
  imports: [LucideAngularModule, Switcher],
})
export class RequestBodySwitcher {
  @HostBinding('class')
  def = 'max-w-48';

  readonly reqBodyTypes = REQ_BODY_TYPES;

  formSvc = inject(FormService);

  isOpen = signal<boolean>(false);

  handleDropwnToggle() {
    this.isOpen.update((prev) => !prev);
  }

  handleActiveItemSelection(id: ReqBodyType) {
    this.formSvc.setBodyType(id);
    this.handleDropwnToggle();
  }
}
