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
import { LucideAngularModule, X } from "lucide-angular";

@Component({
	selector: `dialog[gurl-cp-request-modal]`,
	template: `
    <div class="modal-box">
      <div class="flex flex-col gap-4">
         <div class="flex justify-between">  
             <h3 class="text-lg font-bold">Copy Request</h3>
             <button class="btn btn-sm btn-square btn-ghost" (click)="onClose()" [disabled]="actionInProgress()">
                <lucide-angular [img]="CancelIcon" class="size-4" />
             </button>
        </div>
        <div class="flex flex-col">
          <input
            [ngClass]="{
              'input w-full bg-base-300': true,
              'input-error': error(),
              'input-primary': !error(),
			  'input-ghost': !error()
            }"
            placeholder="Name"
            required
            [value]="requestName()"
            (input)="onInput($event.target.value)"
			(blur)="onBlur()"
            #firstInput
          />
        </div>
      </div>
      <div class="modal-action">
        <button class="btn btn-soft btn-primary" (click)="onSubmit()" [disabled]="actionInProgress() || error()">
            @if(actionInProgress()) {
                <span class="loading loading-spinner"></span>
            }
            Submit
        </button>
      </div>
    </div>
    <div class="modal-backdrop">
      <button (click)="onClose()" [disabled]="actionInProgress()">close</button>
    </div>
  `,
	imports: [NgClass, LucideAngularModule],
})
export class CopyRequestModal implements AfterViewInit {
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
		this.requestName.set(this.initialValue());
		this.firstInputEl()?.nativeElement.focus();
	}

	protected readonly CancelIcon = X;
	private readonly firstInputEl =
		viewChild.required<ElementRef<HTMLInputElement>>("firstInput");

	protected error = signal<boolean>(false);
	protected requestName = signal<string>("");

	protected onInput(text: string) {
		this.error.set(false);
		this.requestName.set(text);
	}

	protected onBlur() {
		const name = this.requestName();
		if (!name || name.trim() === "") {
			this.error.set(true);
		}
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
