import { Component, HostBinding } from "@angular/core";
import { Cog, LucideAngularModule } from "lucide-angular";
import { GurlSidebarToggle } from "./sidebar.toggle";

@Component({
	selector: `gurl-taskbar`,
	template: `
    <header class="flex flex-col gap-4 items-center">
      <div gurl-sidebar-toggle></div>
    </header>
    <footer class="mt-auto flex justify-center flex-col gap-4">
      <button class="btn btn-sm btn-ghost">
        <lucide-angular [img]="SettingsIcon" class="size-5" />
      </button>
    </footer>
  `,
	imports: [LucideAngularModule, GurlSidebarToggle],
})
export class Taskbar {
	@HostBinding("class")
	def =
		"basis-16 grow-0 shrink-0 bg-base-200 flex flex-col items-center p-2 relative border-r-2 border-base-100";

	protected readonly SettingsIcon = Cog;
}
