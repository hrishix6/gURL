import { Component, HostBinding, input, output } from "@angular/core";
import { SystemIconComponent } from "@/common/components/icon";

@Component({
	selector: `dialog[gurl-rm-confirmation-modal]`,
	template: `
    <div class="modal-box">
      <div class="flex flex-col gap-2">
        <div class="flex justify-between">  
             <h3 class="text-lg font-bold">{{title()}}</h3>
             <button class="btn btn-sm btn-square btn-ghost" (click)="handleClose()" [disabled]="actionInProgress()">
                <i gurl-icon [icon]="'Cancel'" [className]="'size-4'" ></i>
             </button>
        </div>
        <p>
           {{message()}}
        </p>
      </div>
      <div class="modal-action">
        <button class="btn btn-soft btn-primary" (click)="handleDelete()" [disabled]="actionInProgress()">
            @if(actionInProgress()){
                <span class="loading loading-spinner"></span>
            }
            Confirm
        </button>
      </div>
    </div>
    <div class="modal-backdrop">
      <button (click)="handleClose()">close</button>
    </div>
  `,
	imports: [SystemIconComponent],
})
export class DeleteConfirmationModal {
	@HostBinding("class")
	def = "modal";

	@HostBinding("attr.open") get checkOpen() {
		return this.isOpen() ? "" : null;
	}

	title = input.required<string>();
	message = input.required<string>();
	isOpen = input.required<boolean>();
	actionInProgress = input.required<boolean>();
	onCancel = output<void>();
	onConfirm = output<void>();

	protected handleClose() {
		this.onCancel.emit();
	}

	protected handleDelete() {
		this.onConfirm.emit();
	}
}
