import { Component, inject } from "@angular/core";
import { ChooseFile } from "@wailsjs/go/storage/Storage";
import { LucideAngularModule, Paperclip, X } from "lucide-angular";
import { BytesPipe } from "@/common/pipes/bytes.pipe";
import { FormService } from "@/services";

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

      } @else{
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
	protected readonly BinaryIcon = Paperclip;
	protected readonly CancelIcon = X;

	protected readonly f = inject(FormService);

	protected async openFileDialogue() {
		try {
			const fileStats = await ChooseFile();
			this.f.setBinaryBody(fileStats);
		} catch (error) {
			console.error(error);
		}
	}

	protected clearFileInput() {
		this.f.clearBinaryBody();
	}
}
