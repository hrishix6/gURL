import {
	type AfterViewInit,
	Component,
	type ElementRef,
	HostBinding,
	input,
	output,
	viewChild,
} from "@angular/core";
import { SystemIconComponent } from "@/common/components/icon";

@Component({
	selector: `dialog[gurl-invite-users-modal]`,
	template: `
            <div class="modal-box">
                    <div class="flex flex-col gap-4">
                        <div class="flex justify-between">  
                            <h3 class="text-lg font-bold">Invite User</h3>
                            <button class="btn btn-sm btn-square btn-ghost" (click)="handleClose()">
                                <i gurl-icon [icon]="'Cancel'" [className]="'size-4'" ></i>
                            </button>
                        </div>
                        <form class="flex flex-col" (submit)="hanndleInvite($event)" >
                            <input
                                    placeholder="user@email.com"
                                    required
                                    type="email"
                                    required
                                    class="input bg-base-300 w-full input-ghost input-primary"
                                    title="Please fill out this field"
                                    #email
                            />
                            <input type="submit" class="hidden" #formSub />
                        </form>
                    </div>
                    <div class="modal-action">
                            <div class="flex justify-end gap-2">
                            <button  class="btn btn-soft btn-primary" (click)="triggerSubmit()">Invite</button>
                    </div>
                    </div>
            </div>
            <div class="modal-backdrop">
                    <button (click)="handleClose()">Cancel</button>
            </div>
    `,
	imports: [SystemIconComponent],
})
export class InviteUsersDialogue implements AfterViewInit {
	@HostBinding("class")
	def = "modal";

	@HostBinding("attr.open") get checkOpen() {
		return this.isOpen() ? "" : null;
	}

	isOpen = input.required<boolean>();
	onCancel = output<void>();
	onInvite = output<string>();

	ngAfterViewInit(): void {
		const inp = this.emailRef().nativeElement;
		inp.value = "";
		inp.focus();
	}

	protected readonly emailRef =
		viewChild.required<ElementRef<HTMLInputElement>>("email");
	protected readonly formRef =
		viewChild.required<ElementRef<HTMLInputElement>>("formSub");

	protected handleClose() {
		this.onCancel.emit();
	}

	triggerSubmit() {
		this.formRef().nativeElement.click();
	}

	hanndleInvite(e: Event) {
		e.preventDefault();
		this.onInvite.emit(this.emailRef().nativeElement.value);
	}
}
