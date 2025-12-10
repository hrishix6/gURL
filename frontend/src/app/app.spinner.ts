import { Component, HostBinding, inject } from '@angular/core';
import { AppService } from '../services';

@Component({
  selector: 'app-spinner',
  template: `
    @if (appSvc.appState() === "initializing") {
    <span class="loading loading-bars loading-xl text-primary"></span>
    }@else {
    <div class="status status-error animate-ping"></div>
    <span class="ml-2 text-2xl">Oops something is wrong</span>
    }
  `,
})
export class AppSpinner {
  @HostBinding('class')
  def = 'h-screen w-dvw bg-base-300 flex items-center justify-center z-999';

  appSvc = inject(AppService);
}
