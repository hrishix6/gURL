import {
	Component,
	type ElementRef,
	inject,
	input,
	output,
	viewChild,
} from "@angular/core";
import type { models } from "@wailsjs/go/models";
import { getAppConfig } from "@/app.config";
import { SystemIconComponent } from "@/common/components/icon";
import { BytesPipe } from "@/common/pipes/bytes.pipe";
import { AlertService, getFileRepository } from "@/services";
import type { AppTabType } from "@/types";

@Component({
	selector: "gurl-file-input",
	template: `
    <div class="flex">
      @if(binaryBody()){
      <div class="flex gap-2 items-center">
        <button class="btn btn-soft btn-primary xl:btn-lg" (click)="openFileDialogue()" [disabled]="tabType() === 'req_example'">
		   <i gurl-icon [icon]="'Attachment'" [className]="'size-6'" ></i>
          {{ binaryBody()!.name }}{{ ' ' }} ({{ binaryBody()!.size | bytes }})
        </button>
        @if(tabType() === 'req' || tabType() === "mock"){
			<button class="btn btn-sm btn-ghost xl:btn-md" (click)="clearFileInput()">
			<i gurl-icon [icon]="'Cancel'" [className]="'size-6'" ></i>
			</button>
        }
      </div>
      }@else{
        @if(mode === "web") {
          <input type="file" class="hidden" #webFileInp (input)="handleWebFileInput($event)"   />
        }
        <button class="btn btn-soft btn-primary xl:btn-lg" (click)="openFileDialogue()" [disabled]="tabType() === 'req_example'">
            <i gurl-icon [icon]="'Attachment'" [className]="'size-6'" ></i>
              Choose a File
        </button>
      }
    </div>
  `,
	imports: [BytesPipe, SystemIconComponent],
})
export class FileInput {
	// inputs
	tabType = input.required<AppTabType>();
	binaryBody = input.required<models.FileStats | null>();

	// outputs
	onFileStats = output<models.FileStats>();
	onClearFile = output<void>();

	private readonly webFileInp =
		viewChild.required<ElementRef<HTMLInputElement>>("webFileInp");

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
			this.onFileStats.emit(fileStats);
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
				this.onFileStats.emit(fstats);
			} catch (_error) {
				this.alertSvc.addAlert("Unable to choose file", "error");
			}
		}
	}

	protected clearFileInput() {
		this.onClearFile.emit();
	}
}
