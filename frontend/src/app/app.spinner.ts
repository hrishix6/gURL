import { Component, HostBinding, inject } from "@angular/core";
import { CircleX, LucideAngularModule } from "lucide-angular";
import { AppService } from "./services";

@Component({
	selector: "gurl-spinner",
	template: `
    @if (appSvc.appState() === "initializing") {
    <span class="loading loading-bars loading-sm xl:loading-lg text-primary"></span>
    }@else {
    <lucide-angular [img]="FailedIcon" class="size-6 text-error" />
    <span class="ml-2 text-2xl text-error">{{ appSvc.appError() }}</span>
    }
  `,
	imports: [LucideAngularModule],
})
export class GlobalSpinner {
	@HostBinding("class")
	def = "h-screen w-dvw bg-base-300 flex items-center justify-center z-999";

	protected appSvc = inject(AppService);
	protected readonly FailedIcon = CircleX;
}
