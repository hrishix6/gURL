import { NgClass } from "@angular/common";
import { Component, HostBinding, inject, input } from "@angular/core";
import type { models } from "@wailsjs/go/models";
import {
	Container,
	Copy,
	EllipsisVertical,
	FileDown,
	LucideAngularModule,
	Trash2,
} from "lucide-angular";
import { getAppConfig } from "@/app.config";
import {
	AppService,
	GlobalModalsService,
	TabsService,
	UserAuthService,
} from "@/services";

@Component({
	selector: `div[gurl-environment-item]`,
	template: `
    <div class="flex items-center gap-2 p-2 bg-base-300 rounded box">
      <a
         href="#"
         role="button"
         class="flex flex-1 items-center gap-2 focus:outline-0 focus:underline"
         (click)="openEnvironmentTab()"
      > 
            <div class="text-primary">
            <lucide-angular [img]="EnvironmentIcon" class="size-4" />
            </div>
            <p class="flex-1 text-sm truncate">{{ data().name }}</p>
        </a>
      <div class="dropdown dropdown-end">
        <button tabindex="0" class="btn btn-sm btn-square btn-ghost">
          <lucide-angular [img]="EnvironmentOptionsIcon" class="size-4" />
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
						<lucide-angular [img]="CopyIcon" class="size-4" />	
						Copy
				</a>
				</li>
				<li 
				[ngClass]="{
					'menu-disabled': !!userAuthSvc.userInfo()?.isDemoUser,
				}"
				>
				<a role="link" [ariaDisabled]="!!userAuthSvc.userInfo()?.isDemoUser"  (click)="toggleDeleteModal()">
						<lucide-angular [img]="DeleteIcon" class="size-4" />	
						Delete
				</a>
				</li>
				<li>
					<button role="link" (click)="toggleExportEnv()">
						<lucide-angular [img]="ExportIcon" class="size-4" />
						Export
					</button>
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
								<lucide-angular [img]="CopyIcon" class="size-4" />	
								Copy
						</a>
						</li>
						<li>
						<a href="#" role="link" (click)="toggleDeleteModal()">
								<lucide-angular [img]="DeleteIcon" class="size-4" />	
								Delete
						</a>
						</li>
						<li>
							<button role="link" (click)="toggleExportEnv()">
								<lucide-angular [img]="ExportIcon" class="size-4" />
								Export
							</button>
						</li>
					</ul>
			}
		}
      
      </div>
    </div>
  `,
	imports: [LucideAngularModule, NgClass],
})
export class GurlEnvironmentItem {
	@HostBinding("class")
	def = "flex flex-col gap-1";

	data = input.required<models.EnvironmentDTO>();

	protected readonly EnvironmentIcon = Container;
	protected readonly config = getAppConfig();
	protected readonly userAuthSvc = inject(UserAuthService);
	protected readonly EnvironmentOptionsIcon = EllipsisVertical;
	protected readonly ExportIcon = FileDown;
	protected readonly DeleteIcon = Trash2;
	protected readonly CopyIcon = Copy;

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
