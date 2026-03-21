import {
	Component,
	computed,
	HostBinding,
	inject,
	type OnInit,
} from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import { AlertService, AppService, TabsService } from "@/services";
import { Breadcrumbs } from "./app.breadcrumb";
import { AppHome } from "./app.home";
import { GlobalSpinner } from "./app.spinner";
import { GurlDropdown } from "./common/components";
import { Alert } from "./common/components/alert";
import { GurlFooter } from "./layout/footer/footer";
import { Navbar } from "./layout/navbar/navbar";
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
          @if(tabsSvc.tabCount()){
              <gurl-navbar />
          }
          <main class="flex flex-1 overflow-hidden">
              @if(tabsSvc.tabCount()){
                  <gurl-taskbar />
                  @if(appSvc.isDesktopSidebarOpen()){
                      <aside gurl-desktop-sidebar></aside>
                  }
               }
                  <!-- Main view -->
                  <main class="flex flex-1 flex-col bg-base-200 overflow-hidden">
                    @if(tabsSvc.tabCount()){
                       <!-- Main header -->
                    <header class="flex basis-14 grow-0 shrink-0 items-center px-2">
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
                    <!-- Main content -->
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

    <!-- Global alerts -->
     <div class="toast toast-start">
      @for(alert of alertSvc.alerts(); track alert.id){
        <gurl-alert [data]="alert"></gurl-alert>
      }
     </div>
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
		GlobalModalsHost,
		Alert,
		Navbar,
	],
})
export class App implements OnInit {
	@HostBinding("class")
	def = "drawer";

	async ngOnInit() {
		await this.appSvc.init();
	}

	protected readonly tabsSvc = inject(TabsService);
	protected readonly appSvc = inject(AppService);
	protected readonly alertSvc = inject(AlertService);

	protected activeItem = computed(() => {
		return this.appSvc
			.environmentDropdownItems()
			.find((x) => x.id === this.appSvc.activeEnvironment());
	});
}
