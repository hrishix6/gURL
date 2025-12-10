import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'aside[appMobileSidebar]',
  template: ``,
})
export class MobileSidebar {
  @HostBinding('class')
  def = 'bg-base-300 min-h-full w-80 flex flex-col';
}
