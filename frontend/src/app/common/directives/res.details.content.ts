import { Directive, HostBinding, input } from "@angular/core";

@Directive({
	selector: `[res-details-tab-content]`,
})
export class ResDetailsTabContentDirective {
	@HostBinding("class") get def() {
		if (this.active()) {
			return "flex-1 flex overflow-hidden";
		}
		return "hidden";
	}

	active = input.required<boolean>();
}
