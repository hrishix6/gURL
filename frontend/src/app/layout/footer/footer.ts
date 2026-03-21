import { Component, HostBinding } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
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
	imports: [GurlLayoutSwitcher, GurlThemeSwitcher, LucideAngularModule],
})
export class GurlFooter {
	@HostBinding("class")
	def = "px-4 py-1 bg-base-200 flex border-t-2 border-base-100";
}
