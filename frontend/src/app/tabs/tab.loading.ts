import { Component, HostBinding } from "@angular/core";

@Component({
	selector: "div[gurl-tab-loading]",
	template: `
         <span class="loading loading-bars loading-sm xl:loading-lg text-primary"></span>
    `,
})
export class TabLoading {
	@HostBinding("class")
	def =
		"absolute top-0 left-0 h-full w-full flex flex-col items-center justify-center bg-base-200 z-999";
}
