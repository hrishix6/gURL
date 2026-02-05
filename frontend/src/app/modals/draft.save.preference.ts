import {
	Component,
	HostBinding,
	input,
	type OnInit,
	output,
	signal,
} from "@angular/core";
import { LucideAngularModule, X } from "lucide-angular";

@Component({
	selector: `dialog[gurl-draft-save-preference-modal]`,
	template: `
        <div class="modal-box">
            <div class="flex flex-col gap-4">
                <div class="flex flex-col gap-4">
                    <div class="flex justify-between">  
						<h3 class="text-lg font-bold">{{title()}}</h3>
						<button class="btn btn-sm btn-square btn-ghost" (click)="handleClose()">
							<lucide-angular [img]="CancelIcon" class="size-4" />
						</button>
					</div>
                    <p>
                        {{ message() }}
                    </p>
                </div>
                <div class="flex flex-col gap-2">
                    <label class="label">
                        <input type="checkbox" class="checkbox" [checked]="alwaysDiscard()" (change)="alwaysDiscardChanges()" />
                        Always discard changes 
                    </label>
					<span class="text-sm opacity-35">
						(You can always change this setting in preferences.)
					</span>
                </div>
                <div class="flex justify-between items-center">
                    <button class="btn btn-soft" (click)="handleNoSave()">
                        Don't Save
                    </button>
                    <div class="flex items-center gap-2">
                    <button class="btn btn-soft btn-primary" (click)="handleSave()">
                        Save
                    </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-backdrop">
        <button (click)="handleClose()">Cancel</button>
        </div>
    `,
	imports: [LucideAngularModule],
})
export class DraftSavePreferenceModal implements OnInit {
	@HostBinding("class")
	def = "modal";

	@HostBinding("attr.open") get checkOpen() {
		return this.isOpen() ? "" : null;
	}

	isOpen = input.required<boolean>();
	title = input.required<string>();
	message = input.required<string>();
	onCancel = output<void>();
	onSave = output<void>();
	onNoSave = output<boolean>();

	ngOnInit(): void {
		this.alwaysDiscard.set(false);
	}

	protected readonly CancelIcon = X;
	protected alwaysDiscard = signal<boolean>(false);

	protected alwaysDiscardChanges() {
		this.alwaysDiscard.update((x) => !x);
	}

	protected handleClose() {
		this.onCancel.emit();
	}

	protected handleSave() {
		this.onSave.emit();
	}

	protected handleNoSave() {
		this.onNoSave.emit(this.alwaysDiscard());
	}
}
