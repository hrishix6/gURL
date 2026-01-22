import { Component, HostBinding, inject } from "@angular/core";
import {
	ChevronsUpDown,
	Container,
	Layers,
	LucideAngularModule,
	Plus,
} from "lucide-angular";
import { AppService, TabsService } from "./services";

@Component({
	selector: `div[appEntityCreation]`,
	template: `
    <div tabindex="0" role="button" class="btn btn-soft btn-primary btn-sm xl:btn-md">
		<lucide-angular [img]="PlusIcon" class="size-4" />
		<span>Create</span>
	</div>
    <ul
      tabindex="-1"
      class="dropdown-content menu bg-base-100 rounded-box z-50 w-48 p-2 shadow-sm"
    >
      <li class="my-0.5">
        <button (click)="toggleCollectionModal()">
			<lucide-angular [img]="CollectionsIcon" class="size-4"  />
			Collection
		</button>
		 <button (click)="handleNewEnvironmentCreation()">
			<lucide-angular [img]="EnvironmentIcon" class="size-4"  />
			Environment
		</button>
      </li>
    </ul>
  `,
	imports: [LucideAngularModule],
})
export class AppEntityCreationButton {
	readonly DropdownIcon = ChevronsUpDown;
	readonly PlusIcon = Plus;
	readonly CollectionsIcon = Layers;
	readonly EnvironmentIcon = Container;

	@HostBinding("class")
	def = "dropdown dropdown-end";

	appSvc = inject(AppService);
	tabSvc = inject(TabsService);

	toggleCollectionModal() {
		this.appSvc.toggleCollectionModal();
		const activeElement = document.activeElement as HTMLAnchorElement;
		activeElement?.blur();
	}

	handleNewEnvironmentCreation() {
		this.tabSvc.createFreshEnvTab();
		const activeElement = document.activeElement as HTMLAnchorElement;
		activeElement?.blur();
	}
}
