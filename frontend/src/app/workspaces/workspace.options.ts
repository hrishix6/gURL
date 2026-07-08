import { NgClass } from "@angular/common";
import { Component, inject, input } from "@angular/core";
import { SystemIconComponent } from "@/common/components/icon";
import { AppService } from "@/services";

@Component({
	selector: "gurl-workspace-options",
	template: `
      <div class="dropdown dropdown-{{align()}}">
				<button tabindex="0" class="btn btn-primary btn-soft btn-sm">
					<i gurl-icon [icon]="'Workspace'" [className]="'size-4 mr-0.5'" ></i>
					{{appSvc.activeWorkSpace().displayName}}
					<i gurl-icon [icon]="'Dropdown'" [className]="'size-4 ml-0.5'" ></i>
				</button>
			<ul
			tabindex="-1"
			class="dropdown-content menu bg-base-100 rounded-box z-50 w-52 shadow-sm"
			>
			   	<li class="menu-title">
					Switch Workspace
				</li>
				@for (item of appSvc.workspaces(); track item.id) {
					 <li class="my-0.5">	
						<a
							role="link"
							[ngClass]="{ 'menu-active': item.id === appSvc.activeWorkSpace().id}"
							(click)="handleWorkspaceSwitch(item.id)"
							>
							<i gurl-icon [icon]="'Workspace'" [className]="'size-4'" ></i>
							<span class="truncate">{{ item.displayName }}</span>
							@if(item.id == appSvc.activeWorkSpace().id) {
							<i gurl-icon [icon]="'Tick'" [className]="'size-4 ml-auto'" ></i>
							}
						</a>
                  </li>
				}
			  	<li class="menu-title">
					Options (TODO)
				</li>
				<li class="my-0.5 menu-disabled">
					<a href="#" (click)="handleOperation('export')" role="link" aria-disabled="true">
						<i gurl-icon [icon]="'Export'" [className]="'size-4'" ></i>
						Export 
					</a>
				</li>
				<li class="my-0.5 menu-disabled">
					<a href="#" (click)="handleOperation('delete')" role="link" aria-disabled="true">
						<i gurl-icon [icon]="'Delete'" [className]="'size-4'" ></i>
						Delete
					</a>
				</li>
			</ul>
	</div>
  `,
	imports: [NgClass, SystemIconComponent],
})
export class WorkspaceOptions {
	align = input.required<"start" | "end">();

	protected readonly appSvc = inject(AppService);

	protected handleOperation(operation: "delete" | "export" | "rename") {
		const activeEl = document.activeElement as HTMLAnchorElement;
		activeEl?.blur();
		switch (operation) {
			case "delete":
			case "export":
			case "rename":
				break;
		}
	}

	protected handleWorkspaceSwitch(id: string) {
		const activeEl = document.activeElement as HTMLAnchorElement;
		activeEl?.blur();
		this.appSvc.switchworkspace(id);
	}
}
