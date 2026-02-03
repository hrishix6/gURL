import { Component, HostBinding, inject, input } from "@angular/core";
import type { models } from "@wailsjs/go/models";
import {
	Container,
	EllipsisVertical,
	FileDown,
	LucideAngularModule,
	Trash2,
} from "lucide-angular";
import { AppService, TabsService } from "@/services";
import { GlobalModalsService } from "@/services/modals.service";

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
        <ul
          tabindex="-1"
          class="dropdown-content menu bg-base-100 rounded-box z-50 w-max shadow-sm"
        >
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
      </div>
    </div>
  `,
	imports: [LucideAngularModule],
})
export class GurlEnvironmentItem {
	@HostBinding("class")
	def = "flex flex-col gap-1";

	data = input.required<models.EnvironmentDTO>();

	protected readonly EnvironmentIcon = Container;
	protected readonly EnvironmentOptionsIcon = EllipsisVertical;
	protected readonly ExportIcon = FileDown;
	protected readonly DeleteIcon = Trash2;

	private readonly tabSvc = inject(TabsService);
	protected readonly appSvc = inject(AppService);
	protected readonly modalsSvc = inject(GlobalModalsService);

	protected openEnvironmentTab() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.tabSvc.createEnvTabFromSaved(this.data());
	}

	protected toggleExportEnv() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.appSvc.exportEnvironment(this.data().id);
	}

	protected toggleDeleteModal() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.modalsSvc.handleOpenDeleteEnvModal(this.data());
	}
}
