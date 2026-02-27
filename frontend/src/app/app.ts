import {
	Component,
	computed,
	HostBinding,
	inject,
	type OnInit,
} from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import { APP_VERSION } from "@/constants";
import { AppService, TabsService } from "@/services";
import { Breadcrumbs } from "./app.breadcrumb";
import { EntityCreationButton } from "./app.entity.create";
import { AppHome } from "./app.home";
import { GlobalSpinner } from "./app.spinner";
import { GurlDropdown } from "./common/components";
import { GurlFooter } from "./layout/footer/footer";
import { DesktopSidebar } from "./layout/sidebar/desktop.sidebar";
import { MobileSidebar } from "./layout/sidebar/mobile.sidebar";
import { Taskbar } from "./layout/taskbar/task.bar";
import { GlobalModalsHost } from "./modals/global.modals.host";
import { TabsContainer } from "./tabs/tabs.container";

@Component({
	selector: "app",
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
        @if (appSvc.appState() === "loaded") {
          <nav class="flex p-2 gap-4 items-center bg-base-300 shadow-md">
              <h2 class="text-lg ml-2 font-semibold text-primary">
                gURL
              </h2>
            <div class="flex-1 flex items-center gap-2">
            </div>
             <div class="flex items-center gap-2">
              <!-- <gurl-dropdown
                [items]="appSvc.workspaces()"
                [activeItem]="appSvc.activeWorkSpace()"
                [align]="'end'"
                [direction]="'down'"
                [size]="'md'"
                [varient]="'soft'"
                (onItemSelection)="handleActiveItemSelection($event)"
                >
                </gurl-dropdown> -->
                <div gurl-entity-creation></div>
             </div>
          </nav>
          <main class="flex flex-1 overflow-hidden">
                  <gurl-taskbar />
                  @if(appSvc.isDesktopSidebarOpen()){
                  <aside gurl-desktop-sidebar></aside>
                  }
                  <!-- Main view -->
                  <main class="flex flex-1 flex-col bg-base-200 overflow-hidden">
                    <!-- Main header -->
                    <header class="flex basis-14 grow-0 shrink-0 items-center px-2">
                        <div class="flex-1 overflow-hidden px-2">
                          <div gurl-breadcrumbs></div>
                        </div>
                        <div class="flex items-center">
                           <gurl-dropdown
                              [activeItem]="activeItem()!"
                              [items]="appSvc.environmentDropdownItems()"
                              (onItemSelection)="appSvc.setActiveEnvironment($event)"
                              [size]="'md'"
                              [align]="'end'"
                              [direction]="'down'"
                              [varient]="'soft'"
                              [icon]="'env'"
                              >
                          </gurl-dropdown>
                        </div>
                    </header>
                    <!-- Main content -->
                    @if(tabsSvc.tabCount()){
                    <section gurl-tabs-container></section>
                    }@else {
                    <section appHome></section>
                    }
                  </main>
             
          </main>
           <!-- Main footer -->
          <footer gurl-footer></footer>
        }@else {
          <gurl-spinner />
        }
      </main>
    </div>
    <!-- This content is rendered inside mobile sidebar -->
    <div class="drawer-side">
      <label class="drawer-overlay" (click)="appSvc.toggleMobileSidebar()"></label>
      <aside gurl-mobile-sidebar></aside>
    </div>
    <!-- Global modals -->
    <gurl-global-modals-host />
  `,
	imports: [
		LucideAngularModule,
		GlobalSpinner,
		GurlFooter,
		DesktopSidebar,
		MobileSidebar,
		TabsContainer,
		AppHome,
		GurlDropdown,
		Taskbar,
		Breadcrumbs,
		EntityCreationButton,
		GlobalModalsHost,
	],
})
export class App implements OnInit {
	@HostBinding("class")
	def = "drawer";

	async ngOnInit() {
		await this.appSvc.init();
	}

	protected tabsSvc = inject(TabsService);
	protected appSvc = inject(AppService);

	protected activeItem = computed(() => {
		return this.appSvc
			.environmentDropdownItems()
			.find((x) => x.id === this.appSvc.activeEnvironment());
	});

	protected readonly appVersion = APP_VERSION;

	protected handleActiveItemSelection(id: string) {
		this.appSvc.setActiveWorkspace(id);
		const activeItem = document.activeElement as HTMLAnchorElement;
		activeItem?.blur();
	}
}
