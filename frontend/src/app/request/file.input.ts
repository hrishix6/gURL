import { Component, inject } from "@angular/core";
import { ChooseFile } from "@wailsjs/go/storage/Storage";
import { LucideAngularModule, Paperclip, X } from "lucide-angular";
import { BytesPipe } from "@/common/pipes/bytes.pipe";
import { FormService } from "@/services";

@Component({
	selector: "app-file-input",
	template: `
    <div class="flex">
      @if(formSvc.binaryBody()){
      <div class="flex gap-2 items-center">
        <button class="btn btn-soft btn-primary xl:btn-lg" (click)="openFileDialogue()">
          <lucide-angular [img]="BinaryIcon" size="24" />
          {{ formSvc.binaryBody()!.name }}{{ ' ' }} ({{ formSvc.binaryBody()!.size | bytes }})
        </button>
        <button class="btn btn-sm btn-ghost xl:btn-md" (click)="clearFileInput()">
          <lucide-angular [img]="CancelIcon" [size]="16"></lucide-angular>
        </button>
      </div>

      } @else{
      <button class="btn btn-soft btn-primary xl:btn-lg" (click)="openFileDialogue()">
        <lucide-angular [img]="BinaryIcon" size="24" />
        Choose a File
      </button>
      }
    </div>
  `,
	imports: [BytesPipe, LucideAngularModule],
})
export class FileInput {
	readonly BinaryIcon = Paperclip;
	readonly CancelIcon = X;
	readonly formSvc = inject(FormService);

	async openFileDialogue() {
		try {
			const fileStats = await ChooseFile();
			this.formSvc.setBinaryBody(fileStats);
		} catch (error) {
			console.error(error);
		}
	}

	clearFileInput() {
		this.formSvc.clearBinaryBody();
	}
}
