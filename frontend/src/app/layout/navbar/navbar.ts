import { Component } from "@angular/core";
import { getAppConfig } from "@/app.config";
import { EntityCreationButton } from "@/app.entity.create";
import { WorkspaceOptions } from "@/workspaces/workspace.options";

@Component({
	selector: "gurl-navbar",
	template: `
        @switch (appConfig?.mode) {
            @case("desktop") {
                <nav class="flex p-2 items-center justify-between bg-base-300 shadow-md">
                    <nav class="flex gap-2 items-center">
                        <gurl-workspace [align]="'start'" />
                    </nav>
                    <nav class="flex items-center gap-2">
                        <div gurl-entity-creation></div>
                    </nav>
              </nav>
            }
            @case("web") {
                <nav class="flex p-2 items-center justify-between bg-base-300 shadow-md">
                    <nav class="flex items-center gap-2">
                        <h2 class="text-primary text-xl mx-2 font-medium">
                            gURL
                            <span class="text-sm">{{ appConfig?.appVersion }}</span>
                        </h2>
                    </nav>
                    <nav class="flex gap-2 items-center">
                        <gurl-workspace [align]="'end'" />
                        <div gurl-entity-creation></div>
                    </nav>
              </nav>
            }
        }
    `,
	imports: [WorkspaceOptions, EntityCreationButton],
})
export class Navbar {
	protected readonly appConfig = getAppConfig();
}
