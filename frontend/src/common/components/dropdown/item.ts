import { NgClass } from '@angular/common';
import { Component, HostBinding, input } from '@angular/core';
import { Check, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: `li[appDropdownItem]`,
  template: `
    <a [attr.data-value]="id()" [ngClass]="{ 'menu-active': isActive() }">
      {{ displayName() }}
      @if(isActive()) {
      <lucide-angular [img]="CheckedIcon" class="size-4  ml-auto" />
      }
    </a>
  `,
  imports: [NgClass, LucideAngularModule],
})
export class AppDropdownItem<T> {
  @HostBinding('class') get defaultClass() {
    return 'my-0.5';
  }

  readonly CheckedIcon = Check;
  isActive = input.required<boolean>();
  displayName = input.required<string>();
  id = input.required<T>();
}
