import { NgClass } from "@angular/common";
import { Component, HostBinding, inject, input } from "@angular/core";
import type { models } from "@wailsjs/go/models";
import { getAppConfig } from "@/app.config";
import { SystemIconComponent } from "@/common/components/icon";
import {
	AppService,
	GlobalModalsService,
	TabsService,
	UserAuthService,
} from "@/services";

@Component({
	selector: `div[gurl-environment-item]`,
	template: `
    <div class="flex items-center gap-2 p-2 bg-base-300 rounded-box">
      <a
         role="button"
         class="flex flex-1 items-center gap-2 hover:cursor-pointer focus:outline-0 focus:underline"
         (click)="openEnvironmentTab()"
      > 
            <i gurl-icon [icon]="'Environment'" [className]="'size-4'" ></i>
            <p class="flex-1 text-sm truncate">{{ data().name }}</p>
        </a>
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
				<li
				[ngClass]="{
					'menu-disabled': !!userAuthSvc.userInfo()?.isDemoUser,
				}"
				>
				<a role="link" [ariaDisabled]="!!userAuthSvc.userInfo()?.isDemoUser"  (click)="copyEnvironment()">
						<i gurl-icon [icon]="'Copy'" [className]="'size-4'" ></i>
						Copy
				</a>
				</li>
				<li 
				[ngClass]="{
					'menu-disabled': !!userAuthSvc.userInfo()?.isDemoUser,
				}"
				>
				<a role="link" [ariaDisabled]="!!userAuthSvc.userInfo()?.isDemoUser"  (click)="toggleDeleteModal()">
						<i gurl-icon [icon]="'Delete'" [className]="'size-4'" ></i>	
						Delete
				</a>
				</li>
				<li>
					<a role="link" (click)="toggleExportEnv()">
						<i gurl-icon [icon]="'Export'" [className]="'size-4'" ></i>
						Export
					</a>
				</li>
			</ul>
			}
			@case ("desktop") {
				  <ul
					tabindex="-1"
					class="dropdown-content menu bg-base-100 rounded-box z-50 w-max shadow-sm"
					>
						<li>
						<a href="#" role="link" (click)="copyEnvironment()">
								<i gurl-icon [icon]="'Copy'" [className]="'size-4'" ></i>
								Copy
						</a>
						</li>
						<li>
							<a href="#" role="link" (click)="toggleDeleteModal()">
								<i gurl-icon [icon]="'Delete'" [className]="'size-4'" ></i>		
								Delete
							</a>
						</li>
						<li>
							<a role="link" (click)="toggleExportEnv()">
								<i gurl-icon [icon]="'Export'" [className]="'size-4'" ></i>
								Export
							</a>
						</li>
					</ul>
			}
		}
      
      </div>
    </div>
  `,
	imports: [NgClass, SystemIconComponent],
})
export class GurlEnvironmentItem {
	@HostBinding("class")
	def = "flex flex-col gap-1";

	data = input.required<models.EnvironmentDTO>();
	protected readonly config = getAppConfig();
	protected readonly userAuthSvc = inject(UserAuthService);

	private readonly tabSvc = inject(TabsService);
	protected readonly appSvc = inject(AppService);
	protected readonly modalsSvc = inject(GlobalModalsService);

	protected openEnvironmentTab() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.tabSvc.createEnvTabFromSaved(this.data());
	}

	protected copyEnvironment() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.appSvc.copyEnvironment(this.data());
	}

	protected toggleExportEnv() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.appSvc.exportEnvironment(this.data().id, this.data().name);
	}

	protected toggleDeleteModal() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.modalsSvc.handleOpenDeleteEnvModal(this.data());
	}
}
