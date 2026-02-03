import { Component, HostBinding, input, output, signal } from "@angular/core";
import { LucideAngularModule, Plus, X } from "lucide-angular";

@Component({
	selector: `dialog[gurl-create-req-modal]`,
	template: `
    <div class="modal-box">
      <div class="flex flex-col gap-2">
        <div class="flex justify-between">  
             <h3 class="text-lg font-bold">New Request</h3>
             <button class="btn btn-sm btn-square btn-ghost" (click)="handleCancel()">
                <lucide-angular [img]="CancelIcon" class="size-4" />
             </button>
        </div>
        <div class="flex gap-4 justify-center mt-4">
          <button class="btn btn-soft btn-primary xl:btn-lg" (click)="handleCreateHttpReq()">
            <lucide-angular [img]="CreateIcon" class="size-6" />
            <span>New HTTP</span>
          </button>
          <button class="btn btn-soft btn-primary xl:btn-lg" (click)="handleCreateWSSReq()">
            <lucide-angular [img]="CreateIcon" class="size-6" />
            <span>New WSS</span>
          </button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop">
      <button (click)="handleCancel()">close</button>
    </div>
  `,
	imports: [LucideAngularModule],
})
export class CreateRequestModal {
	@HostBinding("class")
	def = "modal";

	@HostBinding("attr.open") get checkOpen() {
		return this.isOpen() ? "" : null;
	}

	isOpen = input.required<boolean>();
	onCancel = output<void>();
	onNewHttp = output<void>();
	onNewWSS = output<void>();

	protected readonly CancelIcon = X;
	protected readonly CreateIcon = Plus;
	protected error = signal<boolean>(false);

	protected handleCreateHttpReq() {
		this.onNewHttp.emit();
	}

	protected handleCancel() {
		this.onCancel.emit();
	}

	protected handleCreateWSSReq() {
		this.onNewWSS.emit();
	}
}
