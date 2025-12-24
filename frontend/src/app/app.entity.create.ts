import { Component, HostBinding, inject } from "@angular/core";
import {
	ChevronsUpDown,
	Container,
	Layers,
	LucideAngularModule,
} from "lucide-angular";
import { AppService } from "./services";

@Component({
	selector: `div[appEntityCreation]`,
	template: `
    <div tabindex="0" role="button" class="btn btn-primary btn-sm xl:btn-md">
		Create
		<lucide-angular [img]="DropdownIcon" class="size-4" />
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
		 <button>
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
	readonly CollectionsIcon = Layers;
	readonly EnvironmentIcon = Container;

	@HostBinding("class")
	def = "dropdown dropdown-end";

	appSvc = inject(AppService);

	toggleCollectionModal() {
		this.appSvc.toggleCollectionModal();
		const activeElement = document.activeElement as HTMLAnchorElement;
		activeElement?.blur();
	}
}
