import { NgClass } from "@angular/common";
import {
	type AfterViewInit,
	Component,
	type ElementRef,
	HostBinding,
	input,
	output,
	signal,
	viewChild,
} from "@angular/core";

@Component({
	selector: `dialog[gurl-rename-collection-modal]`,
	template: `
    <div class="modal-box">
      <div class="flex flex-col gap-2">
        <h3 class="text-lg font-bold">Rename Collection</h3>
        <div class="flex flex-col gap-4">
          <input
            [ngClass]="{
              'input input-ghost w-full bg-base-300': true,
              'input-error': error(),
              'input-primary': !error()
            }"
            placeholder="Name"
            required
            [value]="collectionName()"
            (input)="onInput($event.target.value)"
            #firstInput
          />
        </div>
      </div>
      <div class="modal-action">
        <button class="btn btn-soft btn-primary" (click)="onSubmit()" [disabled]="actionInProgress()">
            @if(actionInProgress()) {
                <span class="loading loading-spinner"></span>
            }
            Rename
        </button>
        <button class="btn" (click)="onClose()" [disabled]="actionInProgress()">Cancel</button>
      </div>
    </div>
    <div class="modal-backdrop">
      <button (click)="onClose()" [disabled]="actionInProgress()">close</button>
    </div>
  `,
	imports: [NgClass],
})
export class RenameCollectionModal implements AfterViewInit {
	@HostBinding("class")
	def = "modal";

	@HostBinding("attr.open") get checkOpen() {
		return this.isOpen() ? "" : null;
	}

	actionInProgress = input.required<boolean>();
	isOpen = input.required<boolean>();
	initialValue = input.required<string>();
	onCancel = output<void>();
	onConfirm = output<string>();

	ngAfterViewInit(): void {
		this.collectionName.set(this.initialValue());
		this.firstInputEl()?.nativeElement.focus();
	}

	protected collectionName = signal<string>("");
	private readonly firstInputEl =
		viewChild.required<ElementRef<HTMLInputElement>>("firstInput");
	protected error = signal<boolean>(false);

	protected onInput(text: string) {
		this.error.set(false);
		this.collectionName.set(text);
	}

	protected onClose() {
		this.onCancel.emit();
	}

	protected onSubmit() {
		if (this.collectionName() === "" || this.collectionName().trim() === "") {
			this.error.set(true);
			return;
		}

		this.onConfirm.emit(this.collectionName());
	}
}
