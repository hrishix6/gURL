import { NgClass } from "@angular/common";
import {
	type AfterViewInit,
	Component,
	type ElementRef,
	HostBinding,
	inject,
	input,
	output,
	signal,
	viewChild,
} from "@angular/core";
import { LucideAngularModule, X } from "lucide-angular";
import { AppService } from "@/services";

@Component({
	selector: `dialog[gurl-new-workspace-modal]`,
	template: `
    <div class="modal-box">
      <div class="flex flex-col gap-4">
         <div class="flex justify-between">  
             <h3 class="text-lg font-bold">
				@if(disableClose()) {
					Start by creating a
				}@else {
					New
				}

				workspace
			</h3>
             @if(!disableClose()){
             <button class="btn btn-sm btn-square btn-ghost" (click)="onClose()" [disabled]="actionInProgress()">
                <lucide-angular [img]="CancelIcon" class="size-4" />
             </button>
             }
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
            [value]="workspaceName()"
            (input)="onInput($event.target.value)"
			(blur)="onBlur()"
            #firstInput
          />
          @if(error()){
          <div class="flex items-center px-4"> 
            <span class="text-sm text-error">
                {{errorMsg()}}
            </span>
          </div>
        }
        </div>
      </div>
      <div class="modal-action">
        <button class="btn btn-soft btn-primary" (click)="handleSubmit()" [disabled]="error() || actionInProgress()">
			@if(actionInProgress()) {
                <span class="loading loading-spinner"></span>
            }
			Create
		</button>
      </div>
    </div>
    <div class="modal-backdrop">
      <button (click)="onClose()" [disabled]="actionInProgress()">close</button>
    </div>
  `,
	imports: [NgClass, LucideAngularModule],
})
export class DefaultWorkspaceModal implements AfterViewInit {
	@HostBinding("class")
	def = "modal";

	@HostBinding("attr.open") get checkOpen() {
		return this.isOpen() ? "" : null;
	}

	disableClose = input.required<boolean>();
	isOpen = input.required<boolean>();
	onCancel = output<void>();
	onSubmit = output<string>();
	actionInProgress = input.required<boolean>();

	ngAfterViewInit(): void {
		this.firstInputEl()?.nativeElement.focus();
	}

	protected readonly CancelIcon = X;
	private readonly appSvc = inject(AppService);

	private readonly firstInputEl =
		viewChild.required<ElementRef<HTMLInputElement>>("firstInput");

	protected workspaceName = signal<string>("");
	protected error = signal<boolean>(false);
	protected errorMsg = signal<string>("");

	protected onInput(text: string) {
		this.error.set(false);
		this.workspaceName.set(text);
	}

	protected onBlur() {
		const name = this.workspaceName();
		if (!name || name.trim() === "") {
			this.error.set(true);
		}
	}

	protected onClose() {
		this.onCancel.emit();
	}

	protected handleSubmit() {
		const name = this.workspaceName();
		if (!name || name.trim() === "") {
			this.error.set(true);
			this.errorMsg.set("Name cannot be empty");
			return;
		}

		const exists = this.appSvc
			.workspaces()
			.some((ws) => ws.displayName === name);

		if (exists) {
			this.error.set(true);
			this.errorMsg.set("Workspace with the same name already exists");
			return;
		}

		this.onSubmit.emit(this.workspaceName());
	}
}
