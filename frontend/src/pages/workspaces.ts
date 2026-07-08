import { Component, inject, input, type OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import type { models } from "@wailsjs/go/models";
import { AppService } from "@/services";

@Component({
	selector: "gurl-workspaces-home",
	template: `
        <router-outlet />
    `,
	imports: [RouterOutlet],
})
export class WorkspacesHome implements OnInit {
	workspaces = input.required<models.WorkspaceLightDTO[]>();
	activeWorkspace = input.required<string>();

	private router = inject(Router);
	private route = inject(ActivatedRoute);
	protected readonly appSvc = inject(AppService);

	ngOnInit(): void {
		const workspacesData = this.workspaces();
		const activeWorkspace = this.activeWorkspace();
		if (workspacesData.length && activeWorkspace) {
			this.appSvc.setWorkspaces(workspacesData);
			this.appSvc.setActiveWorkspace(activeWorkspace);
			this.router.navigate([`${activeWorkspace}`], { relativeTo: this.route });
		} else {
			//trigger first time workspace creation setup
			this.appSvc.initiateDefaultWorkspaceCreation$.next();
		}
	}
}
