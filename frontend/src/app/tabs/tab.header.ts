import { Component, HostBinding, HostListener, input, output } from '@angular/core';
import { LucideAngularModule, X } from 'lucide-angular';
import { RequestTabItem } from '../models';

@Component({
  selector: `div[tabHeader]`,
  template: `
    <div class="flex gap-1">
      <div class="badge badge-soft badge-primary badge-xs">{{ data().method }}</div>
      <p>
        @if(data().title.length > 16){
        {{ data().title.slice(0, 13) }}... } @else {
        {{ data().title }}
        }
      </p>
    </div>
    <button class="btn btn-ghost btn-xs" (click)="handleClose()" [disabled]="disableRemove()">
      <lucide-angular [img]="CancelIcon" class="size-3" />
    </button>
  `,
  imports: [LucideAngularModule],
})
export class TabHeader {
  readonly CancelIcon = X;
  isActive = input.required<boolean>();
  data = input.required<RequestTabItem>();
  disableRemove = input.required<boolean>();
  onCloseTab = output();
  onSelectTab = output();

  @HostBinding('class') get def() {
    let defaults = [
      'flex',
      'p-2',
      'justify-between',
      'hover:cursor-pointer',
      'hover:bg-neutral',
      'rounded-sm',
      'items-center',
      'bg-base-300',
      'basis-48',
      'grow-0',
      'shrink-0',
      'overflow-hidden',
      'text-xs',
    ];

    if (this.isActive()) {
      return [...defaults, 'bg-neutral', 'border-t-2', 'border-primary'].join(' ');
    }

    return [...defaults, 'bg-base-100'].join(' ');
  }

  handleClose() {
    this.onCloseTab.emit();
  }

  @HostListener('click')
  handleActivation() {
    this.onSelectTab.emit();
  }
}
