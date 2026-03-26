import { Component, HostBinding, inject } from "@angular/core";
import { CirclePlus, Layers, LucideAngularModule } from "lucide-angular";
import { Logo } from "./app.logo";
import { TabsService } from "./services";

@Component({
	selector: "section[appHome]",
	template: `
    <section class="absolute h-full w-full top-0 left-0 flex justify-center">
      <div class="flex flex-col gap-4 items-center">
        <gurl-logo [size]="'2xl'" />
        <h2 class="text-2xl xl:text-3xl text-">Offline-first API client</h2>
      </div>
    </section>
  `,
	imports: [LucideAngularModule, Logo],
})
export class AppHome {
	readonly PlusIcon = CirclePlus;
	readonly CollectionIcon = Layers;
	readonly tabsSvc = inject(TabsService);

	@HostBinding("class")
	def =
		"flex-1 flex flex-col overflow-hidden border-b border-base-200 relative";
}
