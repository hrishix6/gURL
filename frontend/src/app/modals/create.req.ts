import { Component, HostBinding, inject, signal } from "@angular/core";
import { FileDown, LucideAngularModule, Plus, X } from "lucide-angular";
import { AppService, TabsService } from "@/services";

@Component({
	selector: `dialog[gurl-create-req-modal]`,
	template: `
    <div class="modal-box">
      <div class="flex flex-col gap-2">
        <div class="flex justify-between">  
             <h3 class="text-lg font-bold">New Request</h3>
             <button class="btn btn-sm btn-square btn-ghost" (click)="onClose()">
                <lucide-angular [img]="CancelIcon" class="size-4" />
             </button>
        </div>
        <div class="flex gap-4 justify-center mt-4">
          <button class="btn btn-soft btn-primary xl:btn-lg" (click)="onEmptyCreate()">
            <lucide-angular [img]="CreateIcon" class="size-6" />
            <span>New HTTP</span>
          </button>
          <button class="btn btn-soft btn-primary xl:btn-lg">
            <lucide-angular [img]="CreateIcon" class="size-6" />
            <span>New WSS</span>
          </button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop">
      <button (click)="onClose()">close</button>
    </div>
  `,
	imports: [LucideAngularModule],
})
export class CreateRequestModal {
	@HostBinding("class")
	def = "modal";

	@HostBinding("attr.open") get checkOpen() {
		return this.appSvc.isCreateReqModalOpen() ? "" : null;
	}

	private readonly appSvc = inject(AppService);
	private readonly tabSvc = inject(TabsService);
  
	protected readonly CancelIcon = X;
	protected readonly CreateIcon = Plus;
	protected error = signal<boolean>(false);

	protected onEmptyCreate() {
		this.appSvc.toggleCreateReqModal();
		this.tabSvc.createFreshTab();
	}

	protected onClose() {
		this.appSvc.toggleCreateReqModal();
	}
}
