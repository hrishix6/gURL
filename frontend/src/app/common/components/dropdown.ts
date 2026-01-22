import { NgClass } from "@angular/common";
import { Component, input, output } from "@angular/core";
import { Check, ChevronsUpDown, LucideAngularModule } from "lucide-angular";
import type { DropDownItem } from "@/types";

@Component({
	selector: `app-dropdown`,
	template: `
        <div class="dropdown dropdown-{{direction()}} dropdown-{{align()}}">
            <div tabindex="0" role="button" [ngClass]="{
              'btn': true,
              'btn-primary': primary(),
              'btn-sm': size() === 'sm',
              'btn-xl': size() === 'xl',
              'btn-md': size() === 'md',
              'btn-lg': size() === 'lg',
              'btn-ghost': varient() === 'ghost',
              'btn-soft': varient() === 'soft'
            }">
                {{activeItem().displayName}}
                <lucide-angular [img]="DropdownIcon" class="size-4 ml-0.5" />
            </div>
          <ul
            tabindex="-1"
            class="menu menu-{{size()}} dropdown-content bg-base-100 rounded-box z-50 w-max p-2 shadow-sm"
          >
           @for (item of items(); track item.id) {
          <li class="my-0.5">
            <button
              role="link"
              [ngClass]="{ 'menu-active': item.id === activeItem().id}"
              (click)="handleItemSelection(item.id)"
            >
              {{ item.displayName }}
              @if(item.id == activeItem().id) {
              <lucide-angular [img]="CheckedIcon" class="size-4 ml-auto" />
              }
            </button>
          </li>
        }
        </ul>
      </div>
    `,
	imports: [LucideAngularModule, NgClass],
})
export class AppDropdown<T> {
	readonly DropdownIcon = ChevronsUpDown;
	readonly CheckedIcon = Check;
	items = input.required<readonly DropDownItem<T>[]>();
	activeItem = input.required<DropDownItem<T>>();
	direction = input<"down" | "top">("down");
	align = input<"start" | "end">("start");
	size = input<"sm" | "md" | "lg" | "xl">("md");
	varient = input<"soft" | "ghost" | "default">("default");
	primary = input<boolean>(true);

	onItemSelection = output<T>();

	handleItemSelection(id: T) {
		this.onItemSelection.emit(id);
		const activeEl = document.activeElement as HTMLAnchorElement;
		activeEl?.blur();
	}
}
