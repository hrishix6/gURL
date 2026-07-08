import { NgClass } from "@angular/common";
import {
	Component,
	computed,
	HostBinding,
	inject,
	input,
	type OnInit,
} from "@angular/core";
import { GurlDropdown, Tab } from "@/common/components";
import { SystemIconComponent } from "@/common/components/icon";
import { ReqDetailsTabContentDirective } from "@/common/directives/req.details.content";
import { REQ_METHODS } from "@/constants";
import { DraftSavePreferenceModal } from "@/modals/draft.save.preference";
import { SaveMockModal } from "@/modals/save.mock";
import { AppService, MockTabFormService, TabsService } from "@/services";
import { TabError } from "@/tabs/tab.error";
import { TabLoading } from "@/tabs/tab.loading";
import { type ApplicationTab, AppTabType } from "@/types";
import { MockBody } from "./mock.body";
import { MockMetadata } from "./mock.metadata";

@Component({
	selector: "gurl-mock-tab",
	template: `
        <header class="flex items-center p-2">
            <div class="flex-1 flex gap-2.5 p-2 bg-base-300 items-center rounded-box">
                <gurl-dropdown
                    [items]="reqMethods"
                    [activeItem]="mockFormSvc.method()"
                    [disabled]="false"
                    [size]="'md'"
                    [varient]="'ghost'"
                    (onItemSelection)="mockFormSvc.setSelectedMethod($event)"
                 />
                <input
                        type="text"
                        [placeholder]="pathInputPlaceholderMessage"
                        [ngClass]="{
                            'input input-sm flex-1 input-ghost bg-base-300 input-primary xl:input-md': true,
                            'input-error': mockFormSvc.pathInvalid()
                        }"
                        [value]="mockFormSvc.mockPath()"
                        (input)="mockFormSvc.setMockPath($event.target.value)"
                        (blur)="mockFormSvc.parseMockPath()"
                        [disabled]="false"
                        [readOnly]="false"
                        
                    />
                <button class="btn btn-soft btn-primary" \
                [disabled]="mockFormSvc.disableSave() || mockFormSvc.statusInvalid() || mockFormSvc.delayInvalid()"
                (click)="mockFormSvc.toggleSaveMockModal()"
                >
                    <i gurl-icon [icon]="'Save'" [className]="'size-6'"></i>
                </button>
            </div>
        </header>
        <div class="flex flex-1 overflow-y-auto flex-col gap-2.5">
            <header class="flex justify-between items-center">
                <gurl-section-tabs
                    [defaultActive]="mockFormSvc.activeMockTab()"
                    (onActiveChange)="mockFormSvc.handleSelectMockTab($event)"
                    [tabs]="mockFormSvc.mockTabs"
                    [activeTab]="mockFormSvc.activeMockTab()"
                ></gurl-section-tabs>
                <div class="px-2">
                <gurl-dropdown
                    [activeItem]="activeItem()!"
                    [items]="mockFormSvc.environmentDropdownItems()"
                    (onItemSelection)="mockFormSvc.setActiveEnvironment($event)"
                    [size]="'sm'"
                    [align]="'end'"
                    [direction]="'down'"
                    [varient]="'soft'"
                    [icon]="'env'"
                />
                </div>
            </header>
            <div class="flex-1 px-2 py-1 flex flex-col gap-2 overflow-hidden">  
                <gurl-mock-metadata req-details-tab-content [active]="mockFormSvc.activeMockTab() === 'mock_meta'" />
                <gurl-mock-body req-details-tab-content [active]="mockFormSvc.activeMockTab() === 'mock_body'" />
            </div>
        </div>
    @if(
      !appSvc.alwaysDiscardDrafts() && mockFormSvc.isDraftSavePreferenceModalOpen()
    ){
      <dialog gurl-draft-save-preference-modal
	    [title]="mockFormSvc.saveDraftModalTitle()"
		[message]="mockFormSvc.saveDraftModalMessage()"
        [isOpen]="mockFormSvc.isDraftSavePreferenceModalOpen()"
        (onSave)="handleSaveDraft()"
        (onCancel)="handleClose()"
        (onNoSave)="handleNoSaveDraft($event)"
      ></dialog>
    }

    @if(mockFormSvc.isSaveMockModalOpen()) {
        <dialog gurl-save-mock-modal></dialog>
    }

    @if(mockFormSvc.fetchState().loading) {
        <div gurl-tab-loading></div>
    }
    @if(mockFormSvc.fetchState().error) {
        <div gurl-tab-error></div>
    }
    `,
	imports: [
		SystemIconComponent,
		TabLoading,
		TabError,
		Tab,
		ReqDetailsTabContentDirective,
		MockBody,
		MockMetadata,
		NgClass,
		GurlDropdown,
		DraftSavePreferenceModal,
		SaveMockModal,
	],
	providers: [MockTabFormService],
})
export class MockTab implements OnInit {
	@HostBinding("class") get defaultClass() {
		if (this.activeId() === this.tab().id) {
			return "flex-1 flex flex-col overflow-hidden relative";
		}

		return "hidden";
	}

	protected readonly reqMethods = REQ_METHODS;

	pathInputPlaceholderMessage =
		"enter path e.g /search , leading slash is optional";

	activeId = input.required<string | null>();
	tab = input.required<ApplicationTab>();

	protected mockFormSvc = inject(MockTabFormService);
	protected readonly tabSvc = inject(TabsService);

	protected langMode = computed(() => this.mockFormSvc.bodyType().id);

	ngOnInit(): void {
		this.mockFormSvc.initializeForm(this.tab().id, this.tab().entityId);
	}

	protected activeItem = computed(() => {
		return this.mockFormSvc
			.environmentDropdownItems()
			.find((x) => x.id === this.mockFormSvc.activeEnvironment());
	});

	protected readonly appSvc = inject(AppService);

	protected handleSaveDraft() {
		this.mockFormSvc.toggleDraftSavePreferenceModal();
		this.mockFormSvc.toggleSaveMockModal();
	}

	protected handleClose() {
		this.mockFormSvc.toggleDraftSavePreferenceModal();
	}

	protected handleNoSaveDraft(alwaysDiscard: boolean) {
		this.appSvc.setAlwaysDiscardDrafts(alwaysDiscard);
		this.tabSvc.deleteTab(this.tab().id, AppTabType.Mock);
		this.mockFormSvc.toggleDraftSavePreferenceModal();
	}
}
