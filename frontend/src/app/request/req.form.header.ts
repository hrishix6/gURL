import { NgClass } from '@angular/common';
import { Component, HostBinding, inject } from '@angular/core';
import { LucideAngularModule, SendHorizontal } from 'lucide-angular';
import { FormService } from '../../services';
import { RequestMethod } from '../models';
import { RequestMethodSwitcher } from './method.switcher';

@Component({
  selector: 'app-req-form-header',
  template: `
    <div class="flex gap-2.5 p-2 bg-base-200 items-center">
      <app-req-method-switcher> </app-req-method-switcher>
      <div class="flex-1">
        <input
          type="text"
          [ngClass]="{
            'input input-ghost  xl:input-lg w-full': true,
            'input-primary': formSvc.isValidUrl() || formSvc.url() === '',
            'input-error': !formSvc.isValidUrl(),
          }"
          placeholder="https://example.com"
          [value]="formSvc.url()"
          (input)="formSvc.setUrl($event.target.value)"
          (blur)="formSvc.parseUrl()"
        />
      </div>
      <button
        class="btn btn-ghost btn-primary xl:btn-lg"
        (click)="formSvc.send()"
        [disabled]="formSvc.isReqInProgress()"
      >
        <lucide-angular [img]="SendIcon" [size]="24"></lucide-angular>
      </button>
    </div>
  `,
  imports: [LucideAngularModule, NgClass, RequestMethodSwitcher],
})
export class ReqFormHeader {
  readonly SendIcon = SendHorizontal;

  @HostBinding('class')
  defaultClass = 'flex flex-col gap-2';

  readonly formSvc = inject(FormService);

  handleMethodChange(e: Event) {
    const target = e.target! as HTMLSelectElement;
    this.formSvc.setSelectedMethod(target.value as RequestMethod);
  }
}
