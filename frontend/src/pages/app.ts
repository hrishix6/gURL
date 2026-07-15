import { Component, inject, input, type OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterOutlet } from "@angular/router";
import type { models } from "@wailsjs/go/models";
import { Alert } from "@/common/components/alert";
import { GlobalModalsHost } from "@/modals/global.modals.host";
import { AlertService, AppService } from "@/services";

@Component({
	selector: "gurl-app",
	template: `
	<router-outlet />
    <!-- Global modals -->
    <gurl-global-modals-host />
    <!-- Global alerts -->
	<div class="toast toast-center">
		@for(alert of alertSvc.alerts(); track alert.id){
			<gurl-alert [data]="alert"></gurl-alert>
		}
	</div>
    `,
	imports: [GlobalModalsHost, Alert, RouterOutlet],
})
class AppPage implements OnInit {
	uiState = input.required<models.UIStateDTO | null>();
	private router = inject(Router);
	private route = inject(ActivatedRoute);
	protected readonly appSvc = inject(AppService);
	protected readonly alertSvc = inject(AlertService);

	ngOnInit(): void {
		const uiData = this.uiState();
		if (uiData) {
			this.appSvc.initUiState(uiData);
			this.router.navigate(["workspaces"], { relativeTo: this.route });
		} else {
			this.router.navigate(["/error"], {
				queryParams: {
					code: "err_app_init",
				},
			});
		}
	}
}

export default AppPage;
