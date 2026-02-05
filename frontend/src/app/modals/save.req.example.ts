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
	selector: `dialog[gurl-req-example-modal]`,
	template: `
    <div class="modal-box">
      <div class="flex flex-col gap-4">
         <div class="flex justify-between">  
             <h3 class="text-lg font-bold">Save Example</h3>
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
            [value]="exampleName()"
            (input)="onInput($event.target.value)"
			(blur)="onBlur()"
            #firstInput
          />
        </div>
      </div>
      <div class="modal-action">
        <button class="btn btn-soft btn-primary" (click)="handleSubmit()" [disabled]="error() || actionInProgress()">
			@if(actionInProgress()) {
                <span class="loading loading-spinner"></span>
            }
			Save
		</button>
      </div>
    </div>
    <div class="modal-backdrop">
      <button (click)="onClose()" [disabled]="actionInProgress()">close</button>
    </div>
  `,
	imports: [NgClass, LucideAngularModule],
})
export class SaveReqExampleModal implements AfterViewInit {
	@HostBinding("class")
	def = "modal";

	@HostBinding("attr.open") get checkOpen() {
		return this.isOpen() ? "" : null;
	}

	isOpen = input.required<boolean>();
	onCancel = output<void>();
	onSubmit = output<string>();
	actionInProgress = input.required<boolean>();

	ngAfterViewInit(): void {
		this.firstInputEl()?.nativeElement.focus();
	}

	protected readonly CancelIcon = X;

	private readonly firstInputEl =
		viewChild.required<ElementRef<HTMLInputElement>>("firstInput");

	protected exampleName = signal<string>("");
	protected error = signal<boolean>(false);

	protected onInput(text: string) {
		this.error.set(false);
		this.exampleName.set(text);
	}

	protected onBlur() {
		const name = this.exampleName();
		if (!name || name.trim() === "") {
			this.error.set(true);
		}
	}

	protected onClose() {
		this.onCancel.emit();
	}

	protected handleSubmit() {
		const name = this.exampleName();
		if (!name || name.trim() === "") {
			this.error.set(true);
			return;
		}

		this.onSubmit.emit(this.exampleName());
	}
}
