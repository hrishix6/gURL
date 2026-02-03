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
import { DEFAULT_COLLECTION_ID } from "@/constants";
import { AppService, FormService } from "@/services";
import { LucideAngularModule, X } from "lucide-angular";

@Component({
	selector: `dialog[gurl-save-request-modal]`,
	template: `
    <div class="modal-box">
      <div class="flex flex-col gap-4">
        <div class="flex justify-between">  
             <h3 class="text-lg font-bold">Save Request</h3>
             <button class="btn btn-sm btn-square btn-ghost" (click)="onClose()">
                <lucide-angular [img]="CancelIcon" class="size-4" />
             </button>
        </div>
        <div class="flex flex-col gap-4">
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
			#reqNameInputEl
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
        <button class="btn btn-soft btn-primary" (click)="onSubmit()" [disabled]="error()">Save</button>
      </div>
    </div>
    <div class="modal-backdrop">
      <button (click)="onClose()">close</button>
    </div>
  `,
	imports: [NgClass, LucideAngularModule],
})
export class SaveRequestModal implements AfterViewInit {
	@HostBinding("class")
	def = "modal";

	@HostBinding("attr.open") get checkOpen() {
		return this.formSvc.isSaveRequestModalOpen() ? "" : null;
	}

	ngAfterViewInit(): void {
		this.reqNameInputEl()?.nativeElement.focus();
	}

	protected readonly CancelIcon = X;
	private readonly reqNameInputEl =
		viewChild.required<ElementRef<HTMLInputElement>>("reqNameInputEl");

	private readonly formSvc = inject(FormService);
	protected readonly appSvc = inject(AppService);

	protected requestName = signal<string>(
		this.formSvc.draftParentData().parentRequestName || "",
	);

	protected selectedCollectionId = signal<string>(
		this.formSvc.draftParentData().parentCollectionId || DEFAULT_COLLECTION_ID,
	);
	protected error = signal<boolean>(false);

	protected onInput(text: string) {
		this.error.set(false);
		this.requestName.set(text);
	}

	protected onBlur() {
		const name = this.requestName();
		if (name === "" || name.trim() === "") {
			this.error.set(false);
		}
	}

	protected onCollectionChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		this.selectedCollectionId.set(target.value);
	}

	protected onClose() {
		this.formSvc.toggleSaveRequestModal();
	}

	protected onSubmit() {
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
