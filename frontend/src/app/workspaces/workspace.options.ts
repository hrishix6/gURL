import { NgClass } from "@angular/common";
import { Component, inject, input } from "@angular/core";
import {
	Building,
	Check,
	ChevronsUpDown,
	FileDown,
	LucideAngularModule,
	SquarePen,
	Trash2,
} from "lucide-angular";
import { AppService } from "@/services";

@Component({
	selector: "gurl-workspace",
	template: `
      <div class="dropdown dropdown-{{align()}}">
				<button tabindex="0" class="btn btn-primary btn-soft btn-sm">
					<lucide-angular [img]="WorkspaceIcon" class="size-4 mr-0.5" />
					{{appSvc.activeWorkSpace().displayName}}
					<lucide-angular [img]="DropdownIcon" class="size-4 ml-0.5" />
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
							<lucide-angular [img]="WorkspaceIcon" class="size-4"  /> 
							{{ item.displayName }}
							@if(item.id == appSvc.activeWorkSpace().id) {
							<lucide-angular [img]="CheckedIcon" class="size-4 ml-auto" />
							}
						</a>
                  </li>
				}
			  	<li class="menu-title">
					Options (TODO)
				</li>
				<!-- todo -->
                <!-- <li class="my-0.5 menu-disabled">
					<a href="#" (click)="handleOperation('rename')" role="link" aria-disabled="true">
						<lucide-angular [img]="RenameIcon" class="size-4"  /> 
						Rename 
					</a>
				</li> -->
				<li class="my-0.5 menu-disabled">
					<a href="#" (click)="handleOperation('export')" role="link" aria-disabled="true">
						<lucide-angular [img]="ExportIcon" class="size-4"  /> 
						Export 
					</a>
				</li>
				<li class="my-0.5 menu-disabled">
					<a href="#" (click)="handleOperation('delete')" role="link" aria-disabled="true">
						<lucide-angular [img]="DeleteIcon" class="size-4" /> 
						Delete
					</a>
				</li>
			</ul>
	</div>
  `,
	imports: [LucideAngularModule, NgClass],
})
export class WorkspaceOptions {
	align = input.required<"start" | "end">();

	protected readonly DropdownIcon = ChevronsUpDown;
	protected readonly ExportIcon = FileDown;
	protected readonly DeleteIcon = Trash2;
	protected readonly CheckedIcon = Check;
	protected readonly WorkspaceIcon = Building;
	protected readonly RenameIcon = SquarePen;

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
