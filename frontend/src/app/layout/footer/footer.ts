import { Component, HostBinding } from "@angular/core";
import { GurlLayoutSwitcher } from "./layout.switcher";
import { GurlThemeSwitcher } from "./theme.switcher";

@Component({
	selector: "footer[gurl-footer]",
	template: `
    <div class="flex flex-1 items-center gap-4">
		 <div class="flex items-center gap-4 ml-auto">
				<div gurl-theme-switcher></div>
         		<div gurl-layout-switcher></div>
		 </div>
    </div>
  `,
	imports: [GurlLayoutSwitcher, GurlThemeSwitcher],
})
export class GurlFooter {
	@HostBinding("class")
	def = "px-4 py-1 flex items-center bg-base-200 border-t-2 border-base-100";
}
