import { Component, inject } from "@angular/core";
import { LucideAngularModule, UserRoundPlus } from "lucide-angular";
import { getAppConfig } from "@/app.config";
import { EntityCreationButton } from "@/app.entity.create";
import { GlobalModalsService, UserAuthService } from "@/services";
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
                        @if(appConfig.mode == "web") {
                            @if(userAuthSvc.userInfo()?.isAdmin){
                                <button class="btn btn-sm btn-soft btn-primary" (click)="handleOpenInviteDialogue()">
                                    <lucide-angular [img]="InviteIcon" class="size-4" />
                                    <span class="hidden xl:inline-block">Invite</span>
                                </button>
                            }
                        }
                        <div gurl-entity-creation></div>
                        <gurl-workspace [align]="'end'" />
                    </nav>
        </nav>
    `,
	imports: [WorkspaceOptions, EntityCreationButton, LucideAngularModule],
})
export class Navbar {
	protected readonly appConfig = getAppConfig();
	protected readonly userAuthSvc = inject(UserAuthService);
	private readonly modalsSvc = inject(GlobalModalsService);

	protected readonly InviteIcon = UserRoundPlus;

	handleOpenInviteDialogue() {
		this.modalsSvc.openInviteUserModal();
	}
}
