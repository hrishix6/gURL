import { Component, HostBinding } from '@angular/core';
import { APP_VERSION } from '../../constants';

@Component({
  selector: 'footer[appFooter]',
  template: `
    <span>Milestone</span>
    <span class="badge badge-soft badge-primary ml-1">{{ appVersion }}</span>
  `,
})
export class AppFooter {
  @HostBinding('class')
  def = 'p-2 flex justify-center items-center text-sm';

  readonly appVersion = APP_VERSION;
}
