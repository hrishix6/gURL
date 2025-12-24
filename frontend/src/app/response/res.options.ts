import { Component, HostBinding, inject } from "@angular/core";
import { Check, Copy, CopyCheck, CopyX, Eraser, HardDriveDownload, LucideAngularModule } from "lucide-angular";
import { FormService } from "../services";

@Component({
	selector: `app-res-opts`,
	template: `
    @if(formSvc.responseBody()?.isText) {
      <div class="tooltip tooltip-bottom">
      <div class="tooltip-content">Copy Text</div>
      <button
        class="btn btn-ghost btn-sm"
        (click)="handleCopyToClipboard()"
      >
        @switch (formSvc.copyStatus()) {
            @case ("done") {
               <lucide-angular [img]="CopySuccess" class="size-5 text-success" />
            }
            @case("failed") {
               <lucide-angular [img]="CopyFailed" class="size-5 text-error" />
            }
            @default {
              <lucide-angular [img]="CopyIcon" class="size-5" />
            }
        }

      </button>
    </div>
    }
    <div class="tooltip tooltip-bottom">
      <div class="tooltip-content">Clear Response</div>
      <button
        class="btn btn-ghost btn-sm"
        (click)="formSvc.clearResponse()"
        [disabled]="!formSvc.responseBody()"
      >
        <lucide-angular [img]="ClearIcon" class="size-5" />
      </button>
    </div>
    <div class="tooltip tooltip-bottom">
      <div class="tooltip-content">Save to File</div>
      <button
        class="btn btn-ghost btn-sm"
        (click)="formSvc.saveToFile()"
        [disabled]="!formSvc.responseBody() || formSvc.resStats()?.size == 0"
      >
        <lucide-angular [img]="DownloadIcon" class="size-5" />
      </button>
    </div>
  `,
	imports: [LucideAngularModule],
})
export class ResOptions {
	readonly ClearIcon = Eraser;
  readonly CopyIcon = Copy;
  readonly CopySuccess = CopyCheck;
  readonly CopyFailed = CopyX
	readonly DownloadIcon = HardDriveDownload;

  handleCopyToClipboard() {
      this.formSvc.copyTextResponseToClipboard();
  }

	readonly formSvc = inject(FormService);

	@HostBinding("class")
	dc = "flex gap-2";
}
