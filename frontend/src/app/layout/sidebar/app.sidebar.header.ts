import { Component, inject, signal } from "@angular/core";
import { Ellipsis, LucideAngularModule } from "lucide-angular";
import { AppDropdown } from "../../common/components";
import { AppService } from "../../services";

@Component({
	selector: `div[appSidebarHeader]`,
	template: `
    <header>
      <div class="flex justify-between items-center border-b-2 border-base-100 p-2">
        <app-dropdown
        [items]="appSvc.workspaces()"
        [activeItem]="appSvc.activeWorkSpace()"
        [align]="'start'"
        [direction]="'down'"
        [varient]="'ghost'"
        [size]="'sm'"
        (onItemSelection)="handleActiveItemSelection($event)"
        >
        </app-dropdown>
        <div>
          <button class="btn btn-sm btn-ghost btn-square">
            <lucide-angular [img]="WorkspaceOptsIcon" class="size-4" />
          </button>
        </div>
      </div>
    </header>
  `,
	imports: [LucideAngularModule, AppDropdown],
})
export class AppSidebarHeader {
	readonly WorkspaceOptsIcon = Ellipsis;
	readonly appSvc = inject(AppService);

	isOpen = signal<boolean>(false);

	handleDropwnToggle() {
		this.isOpen.update((prev) => !prev);
	}

	handleActiveItemSelection(id: string) {
		this.appSvc.setActiveWorkspace(id);
		this.handleDropwnToggle();
	}
}
