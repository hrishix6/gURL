import { Component, HostBinding } from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import { AppLayoutSwitcher } from "./layout.switcher";
import { AppSidebarToggle } from "./sidebar.toggle";
import { AppThemeSwitcher } from "./theme.switcher";

@Component({
	selector: "footer[appFooter]",
	template: `
    <div class="flex flex-1 items-center gap-4">
        <div appSidebarToggle></div>
		 <div class="flex items-center gap-4 ml-auto">
				<div appThemeSwithcer></div>
         		<div appLayoutSwitcher></div>
		 </div>
    </div>
  `,
	imports: [
		LucideAngularModule,
		AppSidebarToggle,
		AppThemeSwitcher,
		AppLayoutSwitcher,
	],
})
export class AppFooter {
	@HostBinding("class")
	def = "px-4 py-2 flex items-center bg-base-200 border-t-2 border-base-100";
}
