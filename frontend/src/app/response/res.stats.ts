import { Component, HostBinding, inject, input } from "@angular/core";
import type { models } from "@wailsjs/go/models";
import {
	ArrowDownFromLine,
	ArrowUpFromLine,
	LucideAngularModule,
	Timer,
	TriangleAlert,
} from "lucide-angular";
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
              <lucide-angular [img]="UploadIcon"  class="size-4"/>
              {{data().uploadSize | bytes}} 
          </div>
          |
          <div class="flex gap-1 items-center px-2 text-xs opacity-60">
              <lucide-angular [img]="DownloadSizeIcon"  class="size-4"/>
              {{data().size | bytes}}
          </div>
          |
          <div class="flex gap-1 items-center px-2 text-xs opacity-60">
                <lucide-angular [img]="TimerIcon"  class="size-4"/>
                TFFB : {{data().ttfbMs}}ms
          </div>
    </section>
  `,
	imports: [LucideAngularModule, BytesPipe],
})
export class ResStats {
	@HostBinding("class")
	dc = "flex gap-1";

	data = input.required<models.GurlRes>();
	protected readonly formSvc = inject(FormService);
	protected readonly UploadIcon = ArrowUpFromLine;
	protected readonly DownloadSizeIcon = ArrowDownFromLine;
	protected readonly AlertIcon = TriangleAlert;
	protected readonly TimerIcon = Timer;
}
