import { Component, HostBinding, input, OnInit, output, signal } from "@angular/core";

@Component({
    selector: `dialog[draftSavePreferenceModal]`,
    template: `
        <div class="modal-box">
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-2">
                    <h3 class="text-lg font-bold">{{ title() }}</h3>
                    <p>
                        {{ message() }}
                    </p>
                </div>
                <div>
                    <label class="label">
                        <input type="checkbox" class="checkbox" [checked]="alwaysDiscard()" (change)="alwaysDiscardChanges()" />
                        Always discard changes
                    </label>
                </div>
                <div class="flex justify-between items-center">
                    <button class="btn btn-soft btn-primary" (click)="handleNoSave()">
                        Don't Save
                    </button>
                    <div class="flex items-center gap-2">
                    <button class="btn btn-primary" (click)="handleSave()">
                        Save
                    </button>
                    <button class="btn" (click)="handleClose()">
                        Cancel
                    </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-backdrop">
        <button (click)="handleClose()">Cancel</button>
        </div>
    `,
})
export class DraftSavePreferenceModal implements OnInit {
    @HostBinding("class")
	def = "modal";
	isOpen = input.required<boolean>();
    title = input.required<string>();
	message = input.required<string>();
	onCancel = output<void>();
	onSave = output<void>();
    onNoSave = output<boolean>();
    alwaysDiscard = signal<boolean>(false);

    ngOnInit(): void {
        this.alwaysDiscard.set(false);
    }

	@HostBinding("attr.open") get checkOpen() {
		return this.isOpen() ? "" : null;
	}

    alwaysDiscardChanges() {
		this.alwaysDiscard.update(x => !x);
	}

	handleClose() {
		this.onCancel.emit();
	}

	handleSave() {
		this.onSave.emit();
	}

    handleNoSave() {
        this.onNoSave.emit(this.alwaysDiscard());
    }
}