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
	selector: `dialog[gurl-rename-collection-modal]`,
	template: `
    <div class="modal-box">
      <div class="flex flex-col gap-4">
        <div class="flex justify-between">  
             <h3 class="text-lg font-bold">Rename Collection</h3>
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
            [value]="collectionName()"
            (input)="onInput($event.target.value)"
			(blur)="onBlur()"
            #firstInput
          />
        </div>
      </div>
      <div class="modal-action">
        <button class="btn btn-soft btn-primary" (click)="onSubmit()" [disabled]="actionInProgress() || this.error()">
            @if(actionInProgress()) {
                <span class="loading loading-spinner"></span>
            }
            Rename
        </button>
      </div>
    </div>
    <div class="modal-backdrop">
      <button (click)="onClose()" [disabled]="actionInProgress()">close</button>
    </div>
  `,
	imports: [NgClass, LucideAngularModule],
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

	protected readonly CancelIcon = X;
	protected collectionName = signal<string>("");
	private readonly firstInputEl =
		viewChild.required<ElementRef<HTMLInputElement>>("firstInput");
	protected error = signal<boolean>(false);

	protected onInput(text: string) {
		this.error.set(false);
		this.collectionName.set(text);
	}

	protected onBlur() {
		const name = this.collectionName();
		if (!name || name.trim() === "") {
			this.error.set(true);
		}
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
