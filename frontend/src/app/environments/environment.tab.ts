import { NgClass } from "@angular/common";
import {
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
	selector: "app-env-tab",
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
            <div appEnvFormItem
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
      <dialog draftSavePreferenceModal
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
export class EnvironmentTab implements OnInit {
	readonly SaveIcon = Save;
	readonly EditIcon = Pencil;
	readonly DeleteIcon = Trash2;

	activeId = input.required<string | null>();
	firstInputEl =
		viewChild.required<ElementRef<HTMLInputElement>>("firstInputEl");
	appSvc = inject(AppService);
	tab = input.required<ApplicationTab>();
	envFormSvc = inject(EnvFormService);
	tabSvc = inject(TabsService);

	@HostBinding("class") get defaultClass() {
		if (this.activeId() === this.tab().id) {
			return "flex-1 flex flex-col overflow-hidden";
		}

		return "hidden";
	}

	ngOnInit(): void {
		console.log(`called`);
		this.envFormSvc.initializeEnvForm(this.tab().entityId);
		this.firstInputEl().nativeElement?.focus();
	}

	async handleSaveDraft() {
		await this.envFormSvc.saveEnv();
		this.envFormSvc.toggleDraftSavePreferenceModal();
	}

	handleClose() {
		this.envFormSvc.toggleDraftSavePreferenceModal();
	}

	handleNoSaveDraft(alwaysDiscard: boolean) {
		this.appSvc.setAlwaysDiscardEnvDrafts(alwaysDiscard);
		this.tabSvc.deleteTab(this.tab().id, AppTabType.Env);
		this.envFormSvc.toggleDraftSavePreferenceModal();
	}
}
