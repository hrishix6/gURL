import { NgClass } from "@angular/common";
import { Component, HostBinding, inject, signal } from "@angular/core";
import { DEFAULT_COLLECTION_ID } from "../../constants";
import { AppService, FormService } from "../services";

@Component({
	selector: `dialog[saveRequestModal]`,
	template: `
    <div class="modal-box">
      <div class="flex flex-col gap-2">
        <h3 class="text-lg font-bold">Save Request</h3>
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
          />
          <select class="select w-full select-ghost bg-base-300 select-primary" (change)="onCollectionChange($event)">
            @for (collection of appSvc.collections(); track collection.id) {
            <option [value]="collection.id" [selected]="selectedCollectionId() === collection.id">
              {{ collection.name }}
            </option>
            }
          </select>
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
export class SaveRequestModal {
	@HostBinding("class")
	def = "modal";

	formSvc = inject(FormService);
	appSvc = inject(AppService);

	@HostBinding("attr.open") get checkOpen() {
		return this.formSvc.isSaveRequestModalOpen() ? "" : null;
	}

	requestName = signal<string>(
		this.formSvc.draftParentData().parentRequestName || "",
	);

	selectedCollectionId = signal<string>(
		this.formSvc.draftParentData().parentCollectionId || DEFAULT_COLLECTION_ID,
	);
	error = signal<boolean>(false);

	onInput(text: string) {
		this.error.set(false);
		this.requestName.set(text);
	}

	onCollectionChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		this.selectedCollectionId.set(target.value);
	}

	onClose() {
		this.formSvc.toggleSaveRequestModal();
	}

	onSubmit() {
		if (this.requestName() === "" || this.requestName().trim() === "") {
			this.error.set(true);
			return;
		}

		this.formSvc.saveRequestToCollection(
			this.requestName(),
			this.selectedCollectionId(),
		);
	}
}
