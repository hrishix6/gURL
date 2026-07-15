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
import { SystemIconComponent } from "@/common/components/icon";
import { AppService, MockTabFormService } from "@/services";

@Component({
	selector: `dialog[gurl-save-mock-modal]`,
	template: `
    <div class="modal-box">
      <div class="flex flex-col gap-4">
        <div class="flex justify-between">  
             <h3 class="text-lg font-bold">Save Mock</h3>
             <button class="btn btn-sm btn-square btn-ghost" (click)="onClose()">
                <i gurl-icon [icon]="'Cancel'" [className]="'size-4'" ></i>
             </button>
        </div>
        <div class="flex flex-col gap-4">
          <input
            [ngClass]="{
              'input w-full bg-base-300 input-ghost input-primary': true,
            }"
            placeholder="Name"
            required
            [value]="mockName()"
            (input)="onInput($event.target.value)"
			(blur)="onBlur()"
			#mockNameInputEl
          />
          <select class="select w-full select-ghost bg-base-300 select-primary" (change)="onCollectionChange($event)">
			<option [value]="defaultCollectionId" [selected]="selectedCollectionId()== defaultCollectionId">None</option>
            @for (collection of appSvc.collections(); track collection.id) {
            <option [value]="collection.id" [selected]="selectedCollectionId() === collection.id">
              {{ collection.name }}
            </option>
            }
          </select>
        </div>
		 @if(error()){
          <div class="flex items-center"> 
            <span class="text-sm text-error">
                {{errorMsg()}}
            </span>
          </div>
		 }
      </div>
      <div class="modal-action">
        <button class="btn btn-soft btn-primary" (click)="onSubmit()" [disabled]="error()">Save</button>
      </div>
    </div>
    <div class="modal-backdrop">
      <button (click)="onClose()">close</button>
    </div>
  `,
	imports: [NgClass, SystemIconComponent],
})
export class SaveMockModal implements AfterViewInit {
	@HostBinding("class")
	def = "modal";

	@HostBinding("attr.open") get checkOpen() {
		return this.formSvc.isSaveMockModalOpen() ? "" : null;
	}

	ngAfterViewInit(): void {
		this.mockNameInputEl()?.nativeElement.focus();
	}

	protected readonly defaultCollectionId = "none";

	private readonly mockNameInputEl =
		viewChild.required<ElementRef<HTMLInputElement>>("mockNameInputEl");

	private readonly formSvc = inject(MockTabFormService);
	protected readonly appSvc = inject(AppService);

	protected mockName = signal<string>(
		this.formSvc.parentMeta().parentMockName || "",
	);

	protected selectedCollectionId = signal<string>(
		this.formSvc.parentMeta().parentCollectionId || this.defaultCollectionId,
	);

	protected error = signal<boolean>(false);
	protected errorMsg = signal<string>("");

	protected onInput(text: string) {
		this.error.set(false);
		this.mockName.set(text);
	}

	protected onBlur() {
		const name = this.mockName();
		if (name === "" || name.trim() === "") {
			this.error.set(true);
			this.errorMsg.set("Name cannot be empty");
		}
	}

	protected onCollectionChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		this.selectedCollectionId.set(target.value);

		if (target.value !== this.defaultCollectionId) {
			this.error.set(false);
		}
	}

	protected onClose() {
		this.formSvc.toggleSaveMockModal();
	}

	protected onSubmit() {
		if (this.mockName() === "" || this.mockName().trim() === "") {
			this.error.set(true);
			this.errorMsg.set("Name cannot be empty");
			return;
		}

		if (
			!this.selectedCollectionId() ||
			this.selectedCollectionId() === this.defaultCollectionId
		) {
			this.error.set(true);
			this.errorMsg.set("Collection must be selected");
			return;
		}

		this.formSvc.saveMock(this.mockName(), this.selectedCollectionId());
	}
}
