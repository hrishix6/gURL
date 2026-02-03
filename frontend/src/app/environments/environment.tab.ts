import { NgClass } from "@angular/common";
import {
	type AfterViewInit,
	Component,
	type ElementRef,
	HostBinding,
	inject,
	input,
	type OnInit,
	viewChild,
} from "@angular/core";
import { LucideAngularModule, Pencil, Save, Trash2 } from "lucide-angular";
import { DraftSavePreferenceModal } from "@/modals/draft.save.preference";
import { AppService, TabsService } from "@/services";
import { EnvFormService } from "@/services/env.form.service";
import { type ApplicationTab, AppTabType } from "@/types";
import { EnvironmentFormItem } from "./environment.form.item";

@Component({
	selector: "gurl-env-tab",
	template: `
        <header class="flex items-center px-4 py-2">
            <div class="flex-1 flex gap-2.5 p-2 bg-base-300 items-center rounded-box">
                  <input
                    type="text"
                    [ngClass]="{
                        'input w-full': true,
                        'input-primary input-ghost': !envFormSvc.envNameError(),
                        'input-error': envFormSvc.envNameError()
                    }"
                    placeholder="name"
                    [value]="envFormSvc.environmentName()"
                    (input)="envFormSvc.setEnvironmentName($event.target.value)"
                    (blur)="envFormSvc.validateEnvName()"
                    #firstInputEl
                    />
                <button class="btn btn-soft btn-primary" (click)="envFormSvc.saveEnv()" [disabled]="!tab().isModified || envFormSvc.envNameError()">
                     <lucide-angular [img]="SaveIcon"  class="size-4"/>
                     Save
                </button>
            </div>
        </header>
        @if(envFormSvc.envNameError()){
          <div class="flex items-center px-4"> 
            <span class="text-sm text-error">
                {{envFormSvc.envNameErrMsg()}}
            </span>
          </div>
        }
        <div class="flex flex-1 overflow-y-auto flex-col gap-2.5 p-4">
            @for (item of envFormSvc.environmentFormItems(); track $index) {
            <div gurl-env-form-item
                 [item]="item"
                 (onBlur)="envFormSvc.addItem()"
                 (onDelete)="envFormSvc.deleteItem($event)"
                 (onKeyUpdate)="envFormSvc.updatetItem($event.id, 'key', $event.v)"
                 (onValUpdate)="envFormSvc.updatetItem($event.id, 'val', $event.v)"
                 (onDescriptionUpdate)="envFormSvc.updatetItem($event.id, 'description', $event.v)"
                 (onSecretStatusChange)="envFormSvc.toggleItemSecretStatus($event.id)"
                 ></div>
            }
        </div>
        @if(
        !appSvc.alwaysDiscardEnvDrafts() && envFormSvc.isDraftSavePreferenceModalOpen()
        ){
      <dialog gurl-draft-save-preference-modal
	    [title]="envFormSvc.saveDraftModalTitle()"
		[message]="envFormSvc.saveDraftModalMessage()"
        [isOpen]="envFormSvc.isDraftSavePreferenceModalOpen()"
        (onSave)="handleSaveDraft()"
        (onCancel)="handleClose()"
        (onNoSave)="handleNoSaveDraft($event)"
      ></dialog>
    }
    `,
	providers: [EnvFormService],
	imports: [
		EnvironmentFormItem,
		LucideAngularModule,
		NgClass,
		DraftSavePreferenceModal,
	],
})
export class EnvironmentTab implements OnInit, AfterViewInit {
	@HostBinding("class") get defaultClass() {
		if (this.activeId() === this.tab().id) {
			return "flex-1 flex flex-col overflow-hidden";
		}

		return "hidden";
	}

	activeId = input.required<string | null>();
	tab = input.required<ApplicationTab>();

	ngOnInit(): void {
		this.envFormSvc.initializeEnvForm(this.tab().entityId);
	}

	ngAfterViewInit(): void {
		this.firstInputEl().nativeElement?.focus();
	}

	private readonly tabSvc = inject(TabsService);

	protected readonly SaveIcon = Save;
	protected readonly DeleteIcon = Trash2;
	protected readonly EditIcon = Pencil;
	protected firstInputEl =
		viewChild.required<ElementRef<HTMLInputElement>>("firstInputEl");
	protected readonly appSvc = inject(AppService);
	protected readonly envFormSvc = inject(EnvFormService);

	protected async handleSaveDraft() {
		await this.envFormSvc.saveEnv();
		this.envFormSvc.toggleDraftSavePreferenceModal();
	}

	protected handleClose() {
		this.envFormSvc.toggleDraftSavePreferenceModal();
	}

	protected handleNoSaveDraft(alwaysDiscard: boolean) {
		this.appSvc.setAlwaysDiscardEnvDrafts(alwaysDiscard);
		this.tabSvc.deleteTab(this.tab().id, AppTabType.Env);
		this.envFormSvc.toggleDraftSavePreferenceModal();
	}
}
