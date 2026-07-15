import { Component, HostBinding } from "@angular/core";

@Component({
	selector: "gurl-spinner",
	template: `
    <span class="loading loading-bars loading-sm xl:loading-lg text-primary"></span>
  `,
})
export class GlobalSpinner {
	@HostBinding("class")
	def = "h-screen w-dvw bg-base-300 flex items-center justify-center z-999";
}
