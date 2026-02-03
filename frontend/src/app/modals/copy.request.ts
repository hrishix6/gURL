import { NgClass } from "@angular/common";
import {
	Component,
	type ElementRef,
	HostBinding,
	input,
	type OnInit,
	output,
	signal,
	viewChild,
} from "@angular/core";

@Component({
	selector: `dialog[gurl-cp-request-modal]`,
	template: `
    <div class="modal-box">
      <div class="flex flex-col gap-2">
        <h3 class="text-lg font-bold">Copy Request</h3>
        <div class="flex flex-col gap-4">
          <input
            [ngClass]="{
              'input input-ghost w-full bg-base-300': true,
              'input-error': error(),
              'input-primary': !error()
            }"
            placeholder="Name"
            required
            [value]="requestName()"
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
            Submit
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
export class CopyRequestModal implements OnInit {
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

	ngOnInit(): void {
		this.requestName.set(this.initialValue());
		this.firstInputEl()?.nativeElement.focus();
	}

	private readonly firstInputEl =
		viewChild.required<ElementRef<HTMLInputElement>>("firstInput");

	protected error = signal<boolean>(false);
	protected requestName = signal<string>("");

	protected onInput(text: string) {
		this.error.set(false);
		this.requestName.set(text);
	}

	protected onClose() {
		this.onCancel.emit();
	}

	protected onSubmit() {
		if (this.requestName() === "" || this.requestName().trim() === "") {
			this.error.set(true);
			return;
		}

		this.onConfirm.emit(this.requestName());
	}
}
