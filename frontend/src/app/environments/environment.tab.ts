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
import { BulkKeyValEditor } from "@/common/components/bulk.editor";
import { SystemIconComponent } from "@/common/components/icon";
import { parseTextAsEnvVariables } from "@/common/utils/text";
import { BULK_EDIT_ENV_INSTRUCTION } from "@/constants";
import { DraftSavePreferenceModal } from "@/modals/draft.save.preference";
import { AppService, EnvFormService, TabsService } from "@/services";
import { TabError } from "@/tabs/tab.error";
import { TabLoading } from "@/tabs/tab.loading";
import { type ApplicationTab, AppTabType } from "@/types";
import { EnvironmentFormItem } from "./environment.form.item";

@Component({
	selector: "gurl-env-tab",
	template: `
        <header class="flex items-center p-2">
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
                      <i gurl-icon [icon]="'Save'" [className]="'size-6'" ></i>
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
        <div class="flex flex-1 overflow-y-auto flex-col gap-2.5 p-2">
             @if(envFormSvc.bulkEditMode()){
            <div class="flex-1">
              <gurl-bulk-editor
                  [editInstructions]="bulkEditInstruction"
                  [parseFn]="parseEnvTextFn"
                  [initialValue]="envFormSvc.bulkEnvText()"
                  (onChange)="envFormSvc.bulkupdateEnvItems($event)"
                />
             </div>
            } @else {
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
          }
        </div>
        <footer class="flex items-center justify-end px-2 p-1">
            <label class="label">
                <input type="checkbox" [checked]="envFormSvc.bulkEditMode()" (change)="envFormSvc.toggleBulkEditMode()" class="toggle toggle-primary" />
                  <span class="text-xs">Raw</span>
            </label>
        </footer>
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
    @if(envFormSvc.fetchState().loading) {
        <div gurl-tab-loading></div>
    }
    @if(envFormSvc.fetchState().error) {
        <div gurl-tab-error></div>
    }
    `,
	providers: [EnvFormService],
	imports: [
		EnvironmentFormItem,
		NgClass,
		DraftSavePreferenceModal,
		SystemIconComponent,
		TabLoading,
		TabError,
		BulkKeyValEditor,
	],
})
export class EnvironmentTab implements OnInit, AfterViewInit {
	@HostBinding("class") get defaultClass() {
		if (this.activeId() === this.tab().id) {
			return "flex-1 flex flex-col overflow-hidden relative";
		}

		return "hidden";
	}

	activeId = input.required<string | null>();
	tab = input.required<ApplicationTab>();

	ngOnInit(): void {
		this.envFormSvc.initializeEnvForm(this.tab().id, this.tab().entityId);
	}

	ngAfterViewInit(): void {
		this.firstInputEl().nativeElement?.focus();
	}

	protected readonly bulkEditInstruction = BULK_EDIT_ENV_INSTRUCTION;
	protected readonly parseEnvTextFn = parseTextAsEnvVariables;
	private readonly tabSvc = inject(TabsService);

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
