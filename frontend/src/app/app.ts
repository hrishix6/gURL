import {
	Component,
	HostBinding,
	inject,
	type OnInit,
	signal,
} from "@angular/core";
import { LucideAngularModule } from "lucide-angular";
import { AppDropdown } from "./common/components/dropdown";
import { APP_VERSION } from "../constants";
import { AppService, TabsService } from "./services";
import { AppEntityCreationButton } from "./app.entity.create";
import { AppHome } from "./app.home";
import { AppSpinner } from "./app.spinner";
import { AppFooter } from "./layout/footer/footer";
import { DesktopSidebar } from "./layout/sidebar/desktop.sidebar";
import { MobileSidebar } from "./layout/sidebar/mobile.sidebar";
import { AppTaskbar } from "./layout/taskbar/task.bar";
import { NewCollectionModal } from "./modals/new.collection";
import { AppTabsWrapper } from "./tabs/req.tabs.container";

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
      <main class="h-screen flex relative">
        @if (appSvc.appState() === "loaded") {
        <section appTaskBar></section>
        @if(appSvc.isDesktopSidebarOpen()){
        <aside appDesktopSidebar></aside>
        }
        <!-- Main view -->
        <main class="flex flex-1 flex-col bg-base-200 overflow-hidden">
          <!-- Main header -->
          <header class="flex basis-12 grow-0 shrink-0 items-center p-2">
            @if(tabsSvc.tabCount()){
            <div class="flex-1"></div>
            <div class="flex items-center gap-2 px-2">
              <app-dropdown
              [activeItem]="appSvc.activeEnvironment()"
              [items]="appSvc.environments()"
              (onItemSelection)="appSvc.setActiveEnvironment($event)"
              [size]="'md'"
              [varient]="'ghost'"
              >
              </app-dropdown>

              <div appEntityCreation></div>
            </div>
            }
          </header>
          <!-- Main content -->
          @if(tabsSvc.tabCount()){
          <section appReqTabs></section>
          }@else {
          <section appHome></section>
          }
          <!-- Main footer -->
          <footer appFooter></footer>
        </main>
        } @else {
        <app-spinner />
        }
      </main>
    </div>
    <!-- This content is rendered inside mobile sidebar -->
    <div class="drawer-side">
      <label class="drawer-overlay" (click)="appSvc.toggleMobileSidebar()"></label>
      <aside appMobileSidebar></aside>
    </div>
    <!-- modals -->
    @if(appSvc.isCollectionModalOpen()){
    <dialog newCollectionModal></dialog>
    }
  `,
	imports: [
		LucideAngularModule,
		AppTaskbar,
		AppSpinner,
		AppFooter,
		DesktopSidebar,
		MobileSidebar,
		AppTabsWrapper,
		AppHome,
		AppEntityCreationButton,
		NewCollectionModal,
		AppDropdown,
	],
})
export class App implements OnInit {
	@HostBinding("class")
	def = "drawer";

	tabsSvc = inject(TabsService);
	appSvc = inject(AppService);

	readonly appVersion = APP_VERSION;

	async ngOnInit() {
		await this.appSvc.init();
	}
}
