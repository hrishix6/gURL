import { Component, HostBinding, input, output } from '@angular/core';
import { ChevronsUpDown, LucideAngularModule, LucideIconData } from 'lucide-angular';
import { AppDropdownList } from './list';
import { DropDownItem } from './types';

@Component({
  selector: `details[appDropDown]`,
  template: `
    <summary
      class="btn btn-{{ size() }} btn-ghost btn-primary m-1 {{ fixed() ? '' : 'xl:btn-lg' }}"
      (click)="handleToggleDropdown($event)"
    >
      {{ activeItem().displayName }}
      @if(isOpen()){
      <lucide-angular [img]="closedIcon()" class="size-4" />
      }@else {
      <lucide-angular [img]="openIcon()" class="size-4" />
      }
    </summary>
    <ul
      appDropdownList
      [activeId]="activeItem().id"
      [items]="items()"
      [size]="size()"
      [fixed]="fixed()"
      (onItemSelection)="this.onItemSelection.emit($event)"
    ></ul>
  `,
  imports: [LucideAngularModule, AppDropdownList],
})
export class Switcher<T> {
  readonly DropdownIcon = ChevronsUpDown;
  activeItem = input.required<DropDownItem<T>>();
  openIcon = input<LucideIconData>(this.DropdownIcon);
  closedIcon = input<LucideIconData>(this.DropdownIcon);
  items = input.required<readonly DropDownItem<T>[]>();
  isOpen = input.required<boolean>();
  direction = input<'down' | 'up'>('down');
  align = input<'start' | 'end'>('start');
  fixed = input<boolean>(false);
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  onItemSelection = output<T>();
  onToggleDropdown = output();

  @HostBinding('class') get defaultClass() {
    const defaults = ['dropdown'];

    switch (this.direction()) {
      case 'up':
        defaults.push('dropdown-top');
        break;
      default:
      case 'down':
        break;
    }

    switch (this.align()) {
      case 'end':
        defaults.push('dropdown-end');
        break;
      case 'start':
      default:
        defaults.push('dropdown-start');
        break;
    }

    return defaults.join(' ');
  }

  @HostBinding('attr.open') get checkOpen() {
    return this.isOpen() ? '' : null;
  }

  handleToggleDropdown(e: Event) {
    this.onToggleDropdown.emit();
  }
}
