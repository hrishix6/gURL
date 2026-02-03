import { NgClass } from "@angular/common";
import {
	type AfterViewInit,
	Component,
	type ElementRef,
	HostBinding,
	inject,
	signal,
	viewChild,
} from "@angular/core";
import { AppService } from "@/services";

@Component({
	selector: `dialog[gurl-new-collection-modal]`,
	template: `
    <div class="modal-box">
      <div class="flex flex-col gap-2">
        <h3 class="text-lg font-bold">Add Empty Collection</h3>
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
        <button class="btn btn-soft btn-primary" (click)="onSubmit()">Create</button>
        <button class="btn" (click)="onClose()">Cancel</button>
      </div>
    </div>
    <div class="modal-backdrop">
      <button (click)="onClose()">close</button>
    </div>
  `,
	imports: [NgClass],
})
export class NewCollectionModal implements AfterViewInit {
	@HostBinding("class")
	def = "modal";

	@HostBinding("attr.open") get checkOpen() {
		return this.appSvc.isNewCollectionModalOpen() ? "" : null;
	}

	ngAfterViewInit(): void {
		this.firstInputEl()?.nativeElement.focus();
	}

	private readonly appSvc = inject(AppService);
	private readonly firstInputEl =
		viewChild.required<ElementRef<HTMLInputElement>>("firstInput");

	protected collectionName = signal<string>("");
	protected error = signal<boolean>(false);

	protected onInput(text: string) {
		this.error.set(false);
		this.collectionName.set(text);
	}

	protected onClose() {
		this.appSvc.toggleNewCollectionModal();
	}

	protected onSubmit() {
		if (this.collectionName() === "" || this.collectionName().trim() === "") {
			this.error.set(true);
			return;
		}

		this.appSvc.addCollection(this.collectionName());
	}
}
