import { Component, type ElementRef, inject, viewChild } from "@angular/core";
import { LucideAngularModule, Paperclip, X } from "lucide-angular";
import { getAppConfig } from "@/app.config";
import { BytesPipe } from "@/common/pipes/bytes.pipe";
import { AlertService, FormService, getFileRepository } from "@/services";

@Component({
	selector: "gurl-file-input",
	template: `
    <div class="flex">
      @if(f.bodySvc.binaryBody()){
      <div class="flex gap-2 items-center">
        <button class="btn btn-soft btn-primary xl:btn-lg" (click)="openFileDialogue()" [disabled]="f.tabType() === 'req_example'">
          <lucide-angular [img]="BinaryIcon" size="24" />
          {{ f.bodySvc.binaryBody()!.name }}{{ ' ' }} ({{ f.bodySvc.binaryBody()!.size | bytes }})
        </button>
        @if(f.tabType() === 'req'){
        <button class="btn btn-sm btn-ghost xl:btn-md" (click)="clearFileInput()">
          <lucide-angular [img]="CancelIcon" [size]="16"></lucide-angular>
        </button>
        }
      </div>

      }@else{
        @if(mode === "web") {
          <input type="file" class="hidden" #webFileInp (input)="handleWebFileInput($event)"   />
        }

        <button class="btn btn-soft btn-primary xl:btn-lg" (click)="openFileDialogue()" [disabled]="f.tabType() === 'req_example'">
            <lucide-angular [img]="BinaryIcon" size="24" />
              Choose a File
        </button>
      }
    </div>
  `,
	imports: [BytesPipe, LucideAngularModule],
})
export class FileInput {
	private readonly webFileInp =
		viewChild.required<ElementRef<HTMLInputElement>>("webFileInp");

	protected readonly BinaryIcon = Paperclip;
	protected readonly CancelIcon = X;

	protected readonly f = inject(FormService);
	private readonly fileRepo = getFileRepository();
	private readonly alertSvc = inject(AlertService);
	protected readonly mode = getAppConfig().mode;

	protected async openFileDialogue() {
		try {
			if (this.mode === "web") {
				this.webFileInp().nativeElement?.click();
				return;
			}

			const fileStats = await this.fileRepo.chooseFile();
			this.f.setBinaryBody(fileStats);
		} catch (_error) {
			this.alertSvc.addAlert("Unable to choose file", "error");
		}
	}

	protected async handleWebFileInput(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = target.files;
		if (files?.length) {
			const file = files[0];
			try {
				const fstats = await this.fileRepo.chooseFile(file);
				this.f.setBinaryBody(fstats);
			} catch (_error) {
				this.alertSvc.addAlert("Unable to choose file", "error");
			}
		}
	}

	protected clearFileInput() {
		this.f.clearBinaryBody();
	}
}
