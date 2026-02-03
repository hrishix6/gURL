import { Component, HostBinding, input, output, signal } from "@angular/core";
import { FileDown, LucideAngularModule, Plus, X } from "lucide-angular";

@Component({
	selector: `dialog[gurl-create-env-modal]`,
	template: `
    <div class="modal-box">
      <div class="flex flex-col gap-2">
        <div class="flex justify-between">  
             <h3 class="text-lg font-bold">New Environment</h3>
             <button class="btn btn-sm btn-square btn-ghost" (click)="handleCacnel()">
                <lucide-angular [img]="CancelIcon" class="size-4" />
             </button>
        </div>
        <div class="flex gap-4 justify-center mt-4">
          <button class="btn btn-soft btn-primary xl:btn-lg" (click)="handleEmpty()">
            <lucide-angular [img]="CreateIcon" class="size-6" />
            <span>New</span>
          </button>
          <button class="btn btn-soft btn-primary xl:btn-lg" (click)="handleImport()">
            <lucide-angular [img]="ImportIcon" class="size-6" />
            <span>Import</span>
          </button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop">
      <button (click)="handleCacnel()">close</button>
    </div>
  `,
	imports: [LucideAngularModule],
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
	onImportEnv = output<void>();

	protected readonly ImportIcon = FileDown;
	protected readonly CancelIcon = X;
	protected readonly CreateIcon = Plus;

	protected error = signal<boolean>(false);

	protected handleEmpty() {
		this.onEmptyEnv.emit();
	}

	protected handleCacnel() {
		this.onCancel.emit();
	}

	protected handleImport() {
		this.onImportEnv.emit();
	}
}
