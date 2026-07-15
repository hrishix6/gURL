import {
	Component,
	type ElementRef,
	HostBinding,
	inject,
	input,
	output,
	signal,
	viewChild,
} from "@angular/core";
import { getAppConfig } from "@/app.config";
import { SystemIconComponent } from "@/common/components/icon";
import { AlertService } from "@/services";

@Component({
	selector: `dialog[gurl-create-env-modal]`,
	template: `
    <div class="modal-box">
      <div class="flex flex-col gap-2">
        <div class="flex justify-between">  
             <h3 class="text-lg font-bold">New Environment</h3>
             <button class="btn btn-sm btn-square btn-ghost" (click)="handleCacnel()">
                <i gurl-icon [icon]="'Cancel'" [className]="'size-4'" ></i>
             </button>
        </div>
        <div class="flex gap-4 justify-center mt-4">
          <button class="btn btn-soft btn-primary xl:btn-lg" (click)="handleEmpty()">
            <i gurl-icon [icon]="'Plus'" [className]="'size-6'" ></i>
            <span>New</span>
          </button>
		    @if(mode === "web") {
              <input type="file" accept=".json" class="hidden" #webFileInp (input)="handleWebEnvImport($event)"   />
          }
          <button class="btn btn-soft btn-primary xl:btn-lg" (click)="handleImport()">
            <i gurl-icon [icon]="'Import'" [className]="'size-6'" ></i>
            <span>Import</span>
          </button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop">
      <button (click)="handleCacnel()">close</button>
    </div>
  `,
	imports: [SystemIconComponent],
})
export class CreateEnvironmentModal {
	@HostBinding("class")
	def = "modal";

	@HostBinding("attr.open") get checkOpen() {
		return this.isOpen() ? "" : null;
	}

	isOpen = input.required<boolean>();
	onCancel = output<void>();
	onEmptyEnv = output<void>();
	onImportDesktopEnv = output<void>();
	onImportWebEnv = output<File>();

	private readonly webFileInp =
		viewChild.required<ElementRef<HTMLInputElement>>("webFileInp");
	protected readonly mode = getAppConfig().mode;

	private readonly alertSvc = inject(AlertService);
	protected error = signal<boolean>(false);

	protected async handleWebEnvImport(e: Event) {
		const target = e.target as HTMLInputElement;
		const files = target.files;
		if (files?.length) {
			const file = files[0];

			if (!file.type.includes("json")) {
				this.alertSvc.addAlert(
					"invalid file type, only .json supported",
					"error",
				);
				target.value = "";
				return;
			}

			this.onImportWebEnv.emit(file);
		}
	}

	protected handleEmpty() {
		this.onEmptyEnv.emit();
	}

	protected handleCacnel() {
		this.onCancel.emit();
	}

	protected handleImport() {
		if (this.mode === "web") {
			this.webFileInp().nativeElement?.click();
			return;
		}
		this.onImportDesktopEnv.emit();
	}
}
