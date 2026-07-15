import {
	Component,
	computed,
	HostBinding,
	inject,
	input,
	type OnInit,
} from "@angular/core";
import type { models } from "@wailsjs/go/models";
import { Breadcrumbs } from "@/app.breadcrumb";
import { GurlDropdown } from "@/common/components";
import { GurlFooter } from "@/layout/footer/footer";
import { Navbar } from "@/layout/navbar/navbar";
import { Sidebar } from "@/layout/sidebar/sidebar";
import { Taskbar } from "@/layout/taskbar/task.bar";
import { AppService, TabsService } from "@/services";
import { TabsContainer } from "@/tabs/tabs.container";

@Component({
	selector: "gurl-workspace",
	template: `
		<!-- hidden checkbox control state of mobile sidebar -->
        <input
            id="app-drawer"
            type="checkbox"
            class="drawer-toggle"
            [checked]="appSvc.isMobileSidebarOpen()"
        />
		<div class="drawer-content">
            <main class="h-screen flex flex-col relative overflow-hidden">
				<!-- App navbar -->
				<gurl-navbar />

				<!-- App Content -->
				<section class="flex flex-1 overflow-hidden">
					<!-- Destop Taskbar + Sidebar -->
					@if(appSvc.isDesktopSidebarOpen()){
					<gurl-taskbar [variant]="'desktop'" />
					<aside gurl-sidebar [mode]="'desktop'"></aside>
					}

					<main class="flex flex-1 flex-col bg-base-200 overflow-hidden relative">
							<!-- Tab Header -->
							<header class="flex basis-12 grow-0 shrink-0 items-center px-2">
								<div class="flex-1 overflow-hidden px-2">
									<div gurl-breadcrumbs></div>
								</div>
								<div class="flex gap-2 items-center">
									<gurl-dropdown
										[activeItem]="activeItem()!"
										[items]="appSvc.environmentDropdownItems()"
										(onItemSelection)="appSvc.setActiveEnvironment($event)"
										[size]="'sm'"
										[align]="'end'"
										[direction]="'down'"
										[varient]="'soft'"
										[icon]="'env'"
										>
									</gurl-dropdown>
								</div>
							</header>
							<!-- Tabs -->
							<section gurl-tabs-container></section>
							<!-- Console -->
							@if(appSvc.isConsoleOpen()){
								<div class="absolute w-full h-[45%] bottom-0 left-0 z-10 bg-base-300 flex flex-col border-t-2 border-primary">
									<span>TODO: Implement Console</span>
								</div>
							}
					</main>
        		</section>	

				<!-- App Footer -->
				<footer gurl-footer></footer>
			</main>
        </div>
		<!-- This content is rendered inside mobile sidebar -->
        <div class="drawer-side xl:hidden">
             <label class="drawer-overlay" (click)="appSvc.toggleMobileSidebar()"></label>
            <div class="min-h-full flex flex-1">
                <gurl-taskbar [variant]="'mobile'" />
                <aside gurl-sidebar [mode]="'mobile'"></aside>
            </div>
        </div>
    `,
	imports: [
		TabsContainer,
		Navbar,
		Taskbar,
		GurlFooter,
		Sidebar,
		GurlDropdown,
		Breadcrumbs,
	],
})
class WorkspacePage implements OnInit {
	@HostBinding("class")
	def = "drawer relative";

	workspaceData = input.required<models.WorkspaceDTO | null>();
	protected readonly appSvc = inject(AppService);
	protected readonly tabsSvc = inject(TabsService);
	protected activeItem = computed(() => {
		return this.appSvc
			.environmentDropdownItems()
			.find((x) => x.id === this.appSvc.activeEnvironment());
	});

	ngOnInit(): void {
		const data = this.workspaceData();
		if (data) {
			this.appSvc.initializeActiveWorkspace(data);
		} else {
			console.log(
				`user has no active workspaces initialize first time workspace setup`,
			);
		}
	}
}

export default WorkspacePage;
