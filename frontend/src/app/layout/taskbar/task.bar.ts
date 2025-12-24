import { Component, HostBinding } from "@angular/core";
import { BookOpen, Cog, LucideAngularModule } from "lucide-angular";
import { AppCollectionsToggle } from "./collections.toggle";
import { AppHistoryToggle } from "./history.toggle";

@Component({
	selector: `section[appTaskBar]`,
	template: `
    <header class="flex flex-col gap-4 items-center">
      <div>
        <button class="btn btn-xs btn-ghost xl:btn-sm">
          <lucide-angular [img]="HomeImage" class="size-4 xl:size-5" />
        </button>
      </div>
      <div appHistoryToggle></div>
      <div appCollectionsToggle></div>
    </header>
    <footer class="mt-auto flex justify-center flex-col gap-4">
      <button class="btn btn-xs btn-ghost xl:btn-sm">
        <lucide-angular [img]="SettingsIcon" class="size-4 xl:size-5" />
      </button>
    </footer>
  `,
	imports: [LucideAngularModule, AppHistoryToggle, AppCollectionsToggle],
})
export class AppTaskbar {
	readonly HomeImage = BookOpen;
	readonly SettingsIcon = Cog;

	@HostBinding("class")
	def =
		"basis-16 grow-0 shrink-0 bg-base-100 flex flex-col items-center py-2 px-1 relative";
}
