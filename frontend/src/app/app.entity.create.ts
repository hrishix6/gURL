import { Component, HostBinding, inject } from "@angular/core";
import {
	Building,
	ChevronsUpDown,
	Container,
	FileDown,
	Layers,
	LucideAngularModule,
	Plus,
	RadioTower,
} from "lucide-angular";
import { GlobalModalsService } from "@/services";

@Component({
	selector: `div[gurl-entity-creation]`,
	template: `
    <div tabindex="0" role="button" class="btn btn-soft btn-sm btn-primary">
		<lucide-angular [img]="PlusIcon" class="size-4" />
		<span>Create</span>
	</div>
    <ul
      tabindex="-1"
      class="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow-sm"
    >
		<li>
			<a (click)="toggleWorkspaceModal()">
				<lucide-angular [img]="WorkspaceIcon" class="size-4"  />
				Workspace
			</a>
		</li>
		<li>
			<a (click)="toggleCollectionModal()">
				<lucide-angular [img]="CollectionsIcon" class="size-4"  />
				Collection
			</a>
		</li>
		<li>
			<a (click)="toggleEnvModal()">
				<lucide-angular [img]="EnvironmentIcon" class="size-4"  />
				Environment
			</a>
		</li>
		<li>
			<a (click)="toggleReqModal()">
				<lucide-angular [img]="RequestsIcon" class="size-4"  />
				Request
			</a>
		</li>
    </ul>
  `,
	imports: [LucideAngularModule],
})
export class EntityCreationButton {
	@HostBinding("class")
	def = "dropdown dropdown-end";
	private readonly modalsSvc = inject(GlobalModalsService);

	protected readonly WorkspaceIcon = Building;
	protected readonly DropdownIcon = ChevronsUpDown;
	protected readonly PlusIcon = Plus;
	protected readonly CollectionsIcon = Layers;
	protected readonly EnvironmentIcon = Container;
	protected readonly RequestsIcon = RadioTower;
	protected readonly ImportIcon = FileDown;

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
}
