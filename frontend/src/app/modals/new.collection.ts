import { NgClass } from "@angular/common";
import { Component, HostBinding, inject, signal } from "@angular/core";
import { AppService } from "../services";

@Component({
	selector: `dialog[newCollectionModal]`,
	template: `
    <div class="modal-box">
      <div class="flex flex-col gap-2">
        <h3 class="text-lg font-bold">Create New Collection</h3>
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
          />
        </div>
      </div>
      <div class="modal-action">
        <button class="btn btn-soft btn-primary" (click)="onSubmit()">Submit</button>
        <button class="btn" (click)="onClose()">Cancel</button>
      </div>
    </div>
    <div class="modal-backdrop">
      <button (click)="onClose()">close</button>
    </div>
  `,
	imports: [NgClass],
})
export class NewCollectionModal {
	@HostBinding("class")
	def = "modal";

	@HostBinding("attr.open") get checkOpen() {
		return this.appSvc.isCollectionModalOpen() ? "" : null;
	}

	collectionName = signal<string>("");
	error = signal<boolean>(false);

	onInput(text: string) {
		this.error.set(false);
		this.collectionName.set(text);
	}

	onClose() {
		this.appSvc.toggleCollectionModal();
	}

	onSubmit() {
		if (this.collectionName() === "" || this.collectionName().trim() === "") {
			this.error.set(true);
			return;
		}

		this.appSvc.addCollection(this.collectionName());
	}

	appSvc = inject(AppService);
}
