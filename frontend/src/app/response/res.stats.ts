import { Component, HostBinding, inject, input } from "@angular/core";
import type { models } from "@wailsjs/go/models";
import { Eraser, LucideAngularModule } from "lucide-angular";
import { FormService } from "@/services";

@Component({
	selector: `app-res-stats`,
	template: `
    <div class="join">
         @if(data().success){
          <div class="badge join-item badge-soft badge-success">{{ data().statusText }}</div>
          } @else {
          <div class="badge join-item badge-soft badge-error">{{ data().statusText }}</div>
          }
          <div class="badge join-item badge-soft">
            {{ data().time }} ms
          </div>
          <button class="btn btn-xs btn-soft join-item" (click)="formSvc.clearResponse()">
            <lucide-angular [img]="ClearIcon"  class="size-4"/>
            Clear
          </button>
    </div>
  `,
	imports: [LucideAngularModule],
})
export class ResStats {
	@HostBinding("class")
	dc = "flex items-center gap-2 px-2";
	readonly ClearIcon = Eraser;

	data = input.required<models.GurlRes>();
	formSvc = inject(FormService);
}
