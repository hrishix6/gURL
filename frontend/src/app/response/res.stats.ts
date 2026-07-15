import { Component, HostBinding, inject, input } from "@angular/core";
import type { models } from "@wailsjs/go/models";
import { SystemIconComponent } from "@/common/components/icon";
import { BytesPipe } from "@/common/pipes/bytes.pipe";
import { FormService } from "@/services";

@Component({
	selector: `gurl-res-stats`,
	template: `
    <div class="join">
         @if(data().success){
          <div class="badge join-item badge-soft badge-success">{{ data().statusText }}</div>
          } @else {
          <div class="badge join-item  badge-soft badge-error">{{ data().statusText }}</div>
          }
          <div class="badge join-item  badge-soft">
            {{ data().time }} ms
          </div>
    </div>
     <section class="flex items-center">
          <div class="flex gap-1 items-center px-2 text-xs opacity-60">
              <i gurl-icon [icon]="'DataUploaded'" [className]="'size-4'" ></i>
              {{data().uploadSize | bytes}} 
          </div>
          |
          <div class="flex gap-1 items-center px-2 text-xs opacity-60">
              <i gurl-icon [icon]="'DataDownloaded'" [className]="'size-4'" ></i>
              {{data().size | bytes}}
          </div>
          |
          <div class="flex gap-1 items-center px-2 text-xs opacity-60">
                <i gurl-icon [icon]="'Timer'" [className]="'size-4'" ></i>
                TFFB : {{data().ttfbMs}}ms
          </div>
    </section>
  `,
	imports: [BytesPipe, SystemIconComponent],
})
export class ResStats {
	@HostBinding("class")
	dc = "flex gap-1";

	data = input.required<models.GurlRes>();
	protected readonly formSvc = inject(FormService);
}
