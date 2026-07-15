import { Component, HostBinding } from "@angular/core";
import { SystemIconComponent } from "@/common/components/icon";

@Component({
	selector: "div[gurl-tab-error]",
	template: `
        <div class="flex items-center gap-2 opacity-30">
            <i gurl-icon [icon]="'Failed'" [className]="'size-6'"></i>
            <span class="text-lg">Failed to load</span>
        </div>
    `,
	imports: [SystemIconComponent],
})
export class TabError {
	@HostBinding("class")
	def =
		"absolute top-0 left-0 h-full w-full flex flex-col items-center justify-center bg-base-300 z-999";
}
