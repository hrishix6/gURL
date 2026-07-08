import { Directive, HostBinding, input } from "@angular/core";

@Directive({
	selector: `[sidebar-content]`,
})
export class SidebarContentDirective {
	active = input.required<boolean>();

	@HostBinding("class") get def() {
		if (this.active()) {
			return "flex flex-1 flex-col overflow-hidden";
		}
		return "hidden";
	}
}
