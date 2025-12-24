import { Component, HostBinding, inject } from "@angular/core";
import { Columns2, Github, LucideAngularModule, Rows2 } from "lucide-angular";
import { BrowserOpenURL } from "../../../../wailsjs/runtime/runtime";
import { APP_VERSION } from "../../../constants";
import { AppService } from "../../services";
import { AppSidebarToggle } from "./sidebar.toggle";
import { AppThemeSwitcher } from "./theme.switcher";

@Component({
	selector: "footer[appFooter]",
	template: `
    <div class="flex items-center gap-4">
      <div appSidebarToggle></div>
      <div appThemeSwithcer></div>
      <div>
        @if(appSvc.formLayout() === "h") {
        <div class="tooltip">
          <div class="tooltip-content">Verticle Layout</div>
          <button class="btn btn-sm btn-ghost btn-square" (click)="appSvc.toggleLayout()">
            <lucide-angular [img]="HorizontalIcon" class="size-4" />
          </button>
        </div>

        } @else {
        <div class="tooltip">
          <div class="tooltip-content">Horizontal Layout</div>
          <button class="btn btn-sm btn-ghost btn-square" (click)="appSvc.toggleLayout()">
            <lucide-angular [img]="VerticleIcon" class="size-4" />
          </button>
        </div>

        }
      </div>
      <a
        (click)="handleOpenLink()"
        class="flex gap-2 items-center text-primary hover:cursor-pointer"
      >
        <span class="badge badge-soft badge-sm badge-primary ml-1">
          {{ appVersion }}
        </span>
      </a>
    </div>
  `,
	imports: [LucideAngularModule, AppSidebarToggle, AppThemeSwitcher],
})
export class AppFooter {
	readonly GitIcon = Github;
	readonly HorizontalIcon = Columns2;
	readonly VerticleIcon = Rows2;
	appSvc = inject(AppService);

	@HostBinding("class")
	def =
		"p-2 flex justify-end items-center bg-base-200 border-t-2 border-base-100";

	readonly appVersion = APP_VERSION;
	private readonly github_wiki_link = "https://google.co.in";

	handleOpenLink() {
		BrowserOpenURL(this.github_wiki_link);
	}
}
