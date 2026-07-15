import { Directive, HostBinding, input } from "@angular/core";

@Directive({
	selector: `[req-details-tab-content]`,
})
export class ReqDetailsTabContentDirective {
	active = input.required<boolean>();

	@HostBinding("class") get def() {
		if (this.active()) {
			return "flex flex-1 flex-col overflow-hidden";
		}
		return "hidden";
	}
}
