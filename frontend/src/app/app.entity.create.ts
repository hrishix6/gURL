import { NgClass } from "@angular/common";
import { Component, HostBinding, inject } from "@angular/core";
import {
	AppService,
	GlobalModalsService,
	TabsService,
	UserAuthService,
} from "@/services";
import { getAppConfig } from "./app.config";
import { SystemIconComponent } from "./common/components/icon";

@Component({
	selector: `div[gurl-entity-creation]`,
	template: `
    <div tabindex="0" role="button" class="btn btn-soft btn-sm btn-primary">
		 <i gurl-icon [icon]="'Plus'" [className]="'size-4'" ></i>
		<span class="hidden xl:inline-block">Create</span>
	</div>
	@switch (config.mode) {
		@case ("web") {
		<ul
			tabindex="-1"
			class="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow-sm"
			>
				<li [ngClass]="{
					'menu-disabled': !!userAuthSvc.userInfo()?.isDemoUser,
				}">
					<a role="link" [ariaDisabled]="!!userAuthSvc.userInfo()?.isDemoUser" (click)="toggleWorkspaceModal()">
						<i gurl-icon [icon]="'Workspace'" [className]="'size-4'" ></i>
						Workspace
					</a>
				</li>
				<li [ngClass]="{
					'menu-disabled': !!userAuthSvc.userInfo()?.isDemoUser,
				}">
					<a (click)="toggleCollectionModal()">
						<i gurl-icon [icon]="'Collection'" [className]="'size-4'" ></i>
						Collection
					</a>
				</li>
				<li [ngClass]="{
					'menu-disabled': !!userAuthSvc.userInfo()?.isDemoUser,
				}">
					<a (click)="toggleEnvModal()">
						<i gurl-icon [icon]="'Environment'" [className]="'size-4'" ></i>
						Environment
					</a>
				</li>
				<li>
					<a (click)="toggleReqModal()">
						<i gurl-icon [icon]="'Request'" [className]="'size-4'" ></i>
						Request
					</a>
				</li>
				@if(appSvc.collections().length){
				<li
					[ngClass]="{
					'menu-disabled': !!userAuthSvc.userInfo()?.isDemoUser,
				}"
				>
					<a (click)="handleCreateMock()">
						<i gurl-icon [icon]="'Mock'" [className]="'size-4'" ></i>
						Mock
					</a>
				</li>
			}
		</ul>
		}
		@case ("desktop") {
			 <ul
				tabindex="-1"
				class="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow-sm"
				>
					<li>
						<a role="link" (click)="toggleWorkspaceModal()">
							<i gurl-icon [icon]="'Workspace'" [className]="'size-4'" ></i>
							Workspace
						</a>
					</li>
					<li>
						<a role="link" (click)="toggleCollectionModal()">
							<i gurl-icon [icon]="'Collection'" [className]="'size-4'" ></i>
							Collection
						</a>
					</li>
					<li>
						<a role="link" (click)="toggleEnvModal()">
							<i gurl-icon [icon]="'Environment'" [className]="'size-4'" ></i>
							Environment
						</a>
					</li>
					<li>
						<a role="link" (click)="toggleReqModal()">
							<i gurl-icon [icon]="'Request'" [className]="'size-4'" ></i>
							Request
						</a>
					</li>
					@if(appSvc.collections().length){
					<li>
						<a role="link" (click)="handleCreateMock()">
							<i gurl-icon [icon]="'Mock'" [className]="'size-4'" ></i>
							Mock
						</a>
					</li>
					}
			</ul>
		}
	}
  `,
	imports: [NgClass, SystemIconComponent],
})
export class EntityCreationButton {
	@HostBinding("class")
	def = "dropdown dropdown-end";
	private readonly modalsSvc = inject(GlobalModalsService);
	protected readonly config = getAppConfig();
	protected readonly userAuthSvc = inject(UserAuthService);
	protected readonly tabSvc = inject(TabsService);
	protected readonly appSvc = inject(AppService);

	protected toggleWorkspaceModal() {
		const activeElement = document.activeElement as HTMLAnchorElement;
		activeElement?.blur();
		this.modalsSvc.handleOpenCreateWorkspaceModal();
	}

	protected toggleCollectionModal() {
		const activeElement = document.activeElement as HTMLAnchorElement;
		activeElement?.blur();
		this.modalsSvc.handleOpenCreateCollectionModal();
	}

	protected toggleEnvModal() {
		const activeElement = document.activeElement as HTMLAnchorElement;
		activeElement?.blur();
		this.modalsSvc.handleOpenCreateEnvModal();
	}

	protected toggleReqModal() {
		const activeElement = document.activeElement as HTMLAnchorElement;
		activeElement?.blur();
		this.modalsSvc.handleOpenCreateReqModal();
	}

	protected handleCreateMock() {
		const activeElement = document.activeElement as HTMLAnchorElement;
		activeElement?.blur();
		this.tabSvc.createFreshMockTab();
	}
}
