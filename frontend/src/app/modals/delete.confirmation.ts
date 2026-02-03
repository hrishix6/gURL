import { Component, HostBinding, input, output } from "@angular/core";

@Component({
	selector: `dialog[gurl-rm-confirmation-modal]`,
	template: `
    <div class="modal-box">
      <div class="flex flex-col gap-2">
        <h3 class="text-lg font-bold">{{title()}}</h3>
        <p>
           {{message()}}
        </p>
      </div>
      <div class="modal-action">
        <button class="btn btn-soft btn-primary" (click)="onSubmit()" [disabled]="actionInProgress()">
            @if(actionInProgress()){
                <span class="loading loading-spinner"></span>
            }
            Confirm
        </button>
        <button class="btn" (click)="onClose()" [disabled]="actionInProgress()">
            Cancel
        </button>
      </div>
    </div>
    <div class="modal-backdrop">
      <button (click)="onClose()">close</button>
    </div>
  `,
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

	protected onClose() {
		this.onCancel.emit();
	}

	protected onSubmit() {
		this.onConfirm.emit();
	}
}
