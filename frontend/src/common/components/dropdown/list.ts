import { Component, HostBinding, HostListener, input, output } from '@angular/core';
import { AppDropdownItem } from './item';
import { DropDownItem } from './types';

@Component({
  selector: `ul[appDropdownList]`,
  template: `
    @for (item of items(); track item.id) { @if(item.isTitle){
    <li class="menu-title">
      {{ item.displayName }}
    </li>
    }@else {
    <li
      appDropdownItem
      [displayName]="item.displayName"
      [id]="item.id"
      [isActive]="item.id === activeId()"
    ></li>
    } }
  `,
  imports: [AppDropdownItem],
})
export class AppDropdownList<T> {
  items = input.required<readonly DropDownItem<T>[]>();
  activeId = input.required<T>();
  onItemSelection = output<T>();
  fixed = input<boolean>(false);
  size = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  @HostBinding('class') get defaultClass() {
    const defaults = [
      'bg-base-200',
      //   'border',
      //   'border-primary',
      'dropdown-content',
      'menu',
      'p-2',
      'rounded-box',
      'shadow-sm',
      'w-max',
      'z-1',
    ];

    if (!this.fixed()) {
      defaults.push('xl:menu-lg');
    }

    switch (this.size()) {
      case 'sm':
        defaults.push('menu-sm');
        break;
      case 'lg':
        defaults.push('menu-lg');
        break;
      case 'xl':
        defaults.push('menu-xl');
        break;
      case 'md':
      default:
        break;
    }

    return defaults.join(' ');
  }

  @HostListener('click', ['$event'])
  handleClick(e: PointerEvent) {
    const target = e.target as HTMLElement;
    if (target.tagName == 'A' && target.dataset['value']) {
      this.onItemSelection.emit(target.dataset['value'] as T);
    }
  }
}
