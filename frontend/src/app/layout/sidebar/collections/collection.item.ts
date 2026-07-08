import { NgClass } from "@angular/common";
import {
	Component,
	computed,
	HostBinding,
	inject,
	input,
	signal,
} from "@angular/core";
import type { models } from "@wailsjs/go/models";
import { getAppConfig } from "@/app.config";
import { SystemIconComponent } from "@/common/components/icon";
import {
	AppService,
	GlobalModalsService,
	TabsService,
	UserAuthService,
} from "@/services";
import { FetchStateService } from "@/services/state/fetch.state.service";
import { GurlReqExampleItem } from "./collection.req.example.item";
import { GurlRequestItem } from "./collection.request.item";

@Component({
	selector: `div[gurl-collection-item]`,
	template: `
    <div class="flex items-center gap-2 p-2 bg-base-300 rounded-box">
      <div
        class="flex flex-1 items-center gap-2"
      >
        <div>
          <i gurl-icon [icon]="'Collection'" [className]="'size-4'" ></i>
        </div>
        <p class="flex-1 text-sm truncate">{{ data().name }}</p>
	  </div>
	  <button class="btn btn-sm btn-square btn-ghost" (click)="toggleOpen()">
			@if(isOpen()) {
        		<i gurl-icon [icon]="'ChevronUp'" [className]="'size-4'" ></i>
       		 }@else {
        		<i gurl-icon [icon]="'ChevronDown'" [className]="'size-4'" ></i>
       	 }
	  </button>
      <div class="dropdown dropdown-end">
        <button tabindex="0" class="btn btn-sm btn-square btn-ghost">
          <i gurl-icon [icon]="'Options'" [className]="'size-4'" ></i>
        </button>
		@switch (config.mode) {
			@case ("web") {
				<ul
				tabindex="-1"
				class="dropdown-content menu bg-base-100 rounded-box z-50 w-max shadow-sm"
				>

				<li [ngClass]="{
					'menu-disabled': !!userAuthSvc.userInfo()?.isDemoUser,
				}"
				
				>
					<a role="link" [ariaDisabled]="!!userAuthSvc.userInfo()?.isDemoUser" (click)="toggleRenameModal()"> 
							<i gurl-icon [icon]="'Rename'" [className]="'size-4'" ></i>
						Rename 
			</a>
					</li>
			@if(requestItems().length){
						<li>
							<a role="link" (click)="toggleClearModal()">
								<i gurl-icon [icon]="'Clear'" [className]="'size-4'" ></i>
								Clear
			</a>
						</li>
						<li
				>
							<a role="link" (click)="toggleExportDialogue()">
								<i gurl-icon [icon]="'Export'" [className]="'size-4'" ></i>
								Export
			</a>
						</li>
			}
					<li [ngClass]="{
					'menu-disabled': !!userAuthSvc.userInfo()?.isDemoUser,
				}">
					<a role="link" [ariaDisabled]="!!userAuthSvc.userInfo()?.isDemoUser" (click)="toggleDeleteModal()">
						<i gurl-icon [icon]="'Delete'" [className]="'size-4'" ></i>
						Delete
			</a>
					</li>
				</ul>
			}
			@case ("desktop") {
				<ul
          tabindex="-1"
          class="dropdown-content menu bg-base-100 rounded-box z-50 w-max shadow-sm"
        >

					<li class="my-0.5">
					<button role="link" (click)="toggleRenameModal()"> 
							<i gurl-icon [icon]="'Rename'" [className]="'size-4'" ></i>
						Rename 
					</button>
					</li>
			@if(requestItems().length){
						<li>
							<button role="link" (click)="toggleClearModal()">
								<i gurl-icon [icon]="'Clear'" [className]="'size-4'" ></i>
								Clear
							</button>
						</li>
						<li>
							<button role="link" (click)="toggleExportDialogue()">
								<i gurl-icon [icon]="'Export'" [className]="'size-4'" ></i>
								Export
							</button>
						</li>
					}
					<li>
					<button role="link" (click)="toggleDeleteModal()">
						<i gurl-icon [icon]="'Delete'" [className]="'size-4'" ></i>	
						Delete
					</button>
					</li>
				</ul>
			}
 		}
      </div>
    </div>
    @if(isOpen()) {
	  @if(reqFState().loaded && examplesFState().loaded) {
		 <section class="flex flex-col gap-1">
			@if (requestItems().length) { @for (item of requestItems(); track item.id) {
			<div gurl-request-item [data]="item"></div>
			} } @else {
			<div class="flex items-center gap-2 my-2 justify-center text-sm opacity-25">
				<i gurl-icon [icon]="'Empty'" [className]="'size-4'" ></i>
				No requests
			</div>
			}
			@if (reqExampleItems().length) {
				@for (item of reqExampleItems(); track item.id) {
					<div gurl-req-example-item [data]="item"></div>
				}
			} @else {
				<div class="flex items-center gap-2 my-2 justify-center text-sm opacity-25">
				<i gurl-icon [icon]="'Empty'" [className]="'size-4'" ></i>
					No examples
				</div>
			}
			
		</section>
	  }
	@if(reqFState().loading || examplesFState().loading) {
            <div class="flex items-center gap-2 my-2 justify-center">
                <span class="loading loading-bars loading-xs text-primary"></span>
            </div>
     }
	@if(reqFState().error) {
		<div class="flex flex-col gap-2 items-center my-2 justify-center">
			<div class="flex items-center justify-center opacity-30 gap-2 text-sm">
				<i gurl-icon [icon]="'Failed'" [className]="'size-4'" ></i>
				Failed to load requests.
			</div>
			<div class="flex items-center justify-center">
				<span class="loading loading-bars loading-xs text-primary"></span>
			</div>
		</div>
    }
	@if(examplesFState().error) {
		<div class="flex flex-col gap-2 items-center my-2 justify-center">
			<div class="flex items-center justify-center opacity-30 gap-2 text-sm">
				<i gurl-icon [icon]="'Failed'" [className]="'size-4'" ></i>
				Failed to load examples.
			</div>
			<div class="flex items-center justify-center">
				<span class="loading loading-bars loading-xs text-primary"></span>
			</div>
		</div>
    }
    }
  `,
	imports: [GurlRequestItem, NgClass, SystemIconComponent, GurlReqExampleItem],
})
export class GurlCollectionItem {
	@HostBinding("class")
	def = "flex flex-col gap-1";

	data = input.required<models.CollectionDTO>();

	protected readonly appSvc = inject(AppService);
	protected readonly config = getAppConfig();
	protected readonly userAuthSvc = inject(UserAuthService);
	protected readonly tabSvc = inject(TabsService);
	protected readonly modalsSvc = inject(GlobalModalsService);
	private readonly fetchStateSvc = inject(FetchStateService);

	protected reqFState = computed(() => {
		const c = this.data().id;
		return this.fetchStateSvc.fetchState()[this.fetchStateSvc.requestsFKey(c)];
	});

	protected examplesFState = computed(() => {
		const c = this.data().id;
		return this.fetchStateSvc.fetchState()[this.fetchStateSvc.exampleFKey(c)];
	});

	protected toggleRenameModal() {
		const activeEl = document.activeElement as HTMLElement;
		activeEl?.blur();
		this.modalsSvc.handleOpenRenameCollectionModal(this.data());
	}

	protected toggleExportDialogue() {
		const activeEl = document.activeElement as HTMLElement;
		activeEl?.blur();
		this.appSvc.exportCollection(this.data().id, this.data().name);
	}

	protected toggleDeleteModal() {
		const activeEl = document.activeElement as HTMLElement;
		activeEl?.blur();
		this.modalsSvc.handleOpenDeleteCollectionModal(this.data());
	}

	protected toggleClearModal() {
		const activeEl = document.activeElement as HTMLElement;
		activeEl?.blur();
		this.modalsSvc.handleOpenClearCollectionModal(this.data());
	}

	protected isOpen = signal<boolean>(false);

	protected toggleOpen() {
		this.isOpen.update((x) => !x);
		const c = this.data().id;
		const requestsKey = this.fetchStateSvc.init(
			this.fetchStateSvc.requestsFKey(c),
		);
		const examplesKey = this.fetchStateSvc.init(
			this.fetchStateSvc.exampleFKey(c),
		);

		if (!requestsKey.attempts) {
			this.appSvc.fetchSavedRequests(c);
		}

		if (!examplesKey.attempts) {
			this.appSvc.fetchSavedExamples(c);
		}
	}

	protected requestItems = computed<models.RequestLightDTO[]>(() =>
		this.appSvc
			.savedRequests()
			.filter((x) => x.collectionId === this.data().id),
	);

	protected reqExampleItems = computed<models.ReqExampleLightDTO[]>(() => {
		return this.appSvc
			.savedExamples()
			.filter((x) => x.collectionId === this.data().id);
	});
}
