import { Component } from "@angular/core";
import { getAppConfig } from "@/app.config";
import { EntityCreationButton } from "@/app.entity.create";
import { WorkspaceOptions } from "@/workspaces/workspace.options";

@Component({
	selector: "gurl-navbar",
	template: `
        <nav class="flex p-2 items-center justify-between bg-base-300 shadow-md">
                    <nav class="flex items-center gap-2">
                        <h2 class="text-primary text-xl mx-2 font-medium">
                            gURL
                            <span class="text-sm">{{ appConfig.appVersion }}</span>
                        </h2>
                    </nav>
                    <nav class="flex gap-2 items-center">
                        <div gurl-entity-creation></div>
                        <gurl-workspace [align]="'end'" />
                    </nav>
        </nav>
    `,
	imports: [WorkspaceOptions, EntityCreationButton],
})
export class Navbar {
	protected readonly appConfig = getAppConfig();
}
