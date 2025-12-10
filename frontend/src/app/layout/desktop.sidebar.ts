import { Component, HostBinding } from '@angular/core';

@Component({
  selector: `aside[appDesktopSidebar]`,
  template: ``,
})
export class DesktopSidebar {
  @HostBinding('class')
  def = 'basis-80 hidden xl:flex shrink-0 grow-0 bg-base-300';
}
