import { NgClass } from "@angular/common";
import { Component, input, output } from "@angular/core";
import type { DropDownItem } from "@/types";
import { SystemIconComponent } from "./icon";

@Component({
	selector: `gurl-dropdown`,
	template: `
        @if(disabled()) {
            <button tabindex="0" [ngClass]="{
                  'btn': true,
                  'btn-primary': primary(),
                  'btn-sm': size() === 'sm',
                  'btn-xl': size() === 'xl',
                  'btn-md': size() === 'md',
                  'btn-lg': size() === 'lg',
                  'btn-ghost': varient() === 'ghost',
                  'btn-soft': varient() === 'soft',
                }">
                    @switch(icon()) {
                      @case('workspace') {
                        <i gurl-icon [icon]="'Workspace'" [className]="'size-4 mr-0.5'" ></i>
                      }
                      @case("env") {
                        
                        <i gurl-icon [icon]="'Environment'" [className]="'size-4 mr-0.5'" ></i>
                      }
                      @case("collection") {
                        <i gurl-icon [icon]="'Collection'" [className]="'size-4 mr-0.5'" ></i>
                      }
                      @case("req") {
                        <i gurl-icon [icon]="'Request'" [className]="'size-4 mr-0.5'" ></i>
                      }
                    }
                    {{activeItem().displayName}}
                    <i gurl-icon [icon]="'Dropdown'" [className]="'size-4 ml-0.5'" ></i>
            </button>
        }@else{
            <div class="dropdown dropdown-{{direction()}} dropdown-{{align()}}">
                <button tabindex="0" [ngClass]="{
                  'btn': true,
                  'btn-primary': primary(),
                  'btn-sm': size() === 'sm',
                  'btn-xl': size() === 'xl',
                  'btn-md': size() === 'md',
                  'btn-lg': size() === 'lg',
                  'btn-ghost': varient() === 'ghost',
                  'btn-soft': varient() === 'soft',
                }">
                    @switch(icon()) {
                      @case('workspace') {
                        <i gurl-icon [icon]="'Workspace'" [className]="'size-4 mr-0.5'" ></i>
                      }
                      @case("env") {
                         <i gurl-icon [icon]="'Environment'" [className]="'size-4 mr-0.5'" ></i>
                      }
                      @case("collection") {
                        <i gurl-icon [icon]="'Collection'" [className]="'size-4 mr-0.5'" ></i>
                      }
                      @case("req") {
                         <i gurl-icon [icon]="'Request'" [className]="'size-4 mr-0.5'" ></i>
                      }
                    }
                    {{activeItem().displayName}}
                    <i gurl-icon [icon]="'Dropdown'" [className]="'size-4 ml-0.5'" ></i>
                </button>
              <div class="max-h-96 overflow-y-auto dropdown-content ">
              <ul
                tabindex="-1"
                class="menu menu-{{size()}} bg-base-100 rounded-box z-50 w-max p-2 shadow-sm"
              >
              @for (item of items(); track item.id) {
                @if(item.isTitle) {
                  <li class="menu-title">{{item.displayName}}</li>
                }
                @else {
                  <li class="my-0.5">
                    <button
                      role="link"
                      [ngClass]="{ 'menu-active': item.id === activeItem().id}"
                      (click)="handleItemSelection(item.id)"
                    >
                      {{ item.displayName }}
                      @if(item.id == activeItem().id) {
                       <i gurl-icon [icon]="'Tick'" [className]="'size-4 ml-auto'" ></i>
                      }
                    </button>
                  </li>
                }
            }
            </ul>
              </div>
          </div>
        }
    `,
	imports: [NgClass, SystemIconComponent],
})
export class GurlDropdown<T> {
	items = input.required<readonly DropDownItem<T>[]>();
	activeItem = input.required<DropDownItem<T>>();
	direction = input<"down" | "top">("down");
	align = input<"start" | "end">("start");
	icon = input<"workspace" | "env" | "collection" | "req" | "none">("none");
	size = input<"sm" | "md" | "lg" | "xl">("md");
	varient = input<"soft" | "ghost" | "default">("default");
	disabled = input<boolean>(false);
	primary = input<boolean>(true);
	onItemSelection = output<T>();

	protected handleItemSelection(id: T) {
		if (this.disabled()) {
			return;
		}
		this.onItemSelection.emit(id);
		const activeEl = document.activeElement as HTMLAnchorElement;
		activeEl?.blur();
	}
}
