import {
	Component,
	HostBinding,
	inject,
	type OnDestroy,
	type OnInit,
	signal,
} from "@angular/core";
import { Router } from "@angular/router";
import { HEALTH_CHECK_INTERVAL_SECONDS } from "@/constants";
import { RestClient, UserAuthService } from "@/services";

@Component({
	selector: "gurl-status-beacon",
	template: `
        @switch (status()) {
            @case ("on") {
					<div class="status status-success animate-pulse"></div>
					<span class="text-xs text-success font-semibold">Connected</span>
            }
            @case("off") {
					<div class="status status-error animate-ping"></div>
					<span class="text-xs text-error font-semibold">Disconnected</span>
            }
        }
    `,
})
export class GurlStatusBeacon implements OnInit, OnDestroy {
	@HostBinding("class") get def() {
		if (this.status() === "on") {
			return "flex items-center gap-2 bg-success/10 py-1 px-3";
		}

		return "flex items-center gap-2 bg-error/10 py-1 px-3";
	}

	protected readonly MAX_FAILED_ATTEMPTS = 3;
	protected failedHealthChecks = signal<number>(0);
	protected status = signal<"on" | "off">("on");
	protected statusCode = signal<number>(200);
	protected timeoutId: number | null = null;
	private readonly userAuthSvc = inject(UserAuthService);
	private readonly router = inject(Router);

	private readonly restClient = RestClient.getInstance();

	ngOnInit(): void {
		this.healthCheck();
	}

	ngOnDestroy(): void {
		this.cleanup();
	}

	cleanup() {
		this.failedHealthChecks.set(0);
		if (this.timeoutId) {
			clearTimeout(this.timeoutId);
		}
	}

	private async healthCheck() {
		let waitTimeMs: number = 0;
		try {
			const response = await this.restClient.get("health");
			if (!response.success) {
				if (response.error.message.includes("unauthorized")) {
					throw new Error("401");
				} else {
					throw new Error("500");
				}
			}
			this.failedHealthChecks.set(0);
			this.status.set("on");
			waitTimeMs =
				2 ** this.failedHealthChecks() * (HEALTH_CHECK_INTERVAL_SECONDS * 1000);
		} catch (error: any) {
			if ("message" in error) {
				if (Number.isNaN(+error.message)) {
					this.statusCode.set(500);
				} else {
					this.statusCode.set(+error.message);
				}
			}
			console.error(error);
			this.status.set("off");
			this.failedHealthChecks.update((x) => x + 1);
			waitTimeMs =
				2 ** this.failedHealthChecks() * (HEALTH_CHECK_INTERVAL_SECONDS * 1000);
		} finally {
			const failedAttempts = this.failedHealthChecks();
			if (failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
				this.cleanup();
				await this.userAuthSvc.logout();
				switch (this.statusCode()) {
					case 401: {
						this.router.navigate(["/error"], {
							queryParams: {
								code: "ok_session_expired",
							},
						});
						break;
					}
					default: {
						this.router.navigate(["/error"], {
							queryParams: {
								code: "err_server_disconnected",
							},
						});
					}
				}
			} else {
				this.timeoutId = setTimeout(() => {
					this.healthCheck();
				}, waitTimeMs);
			}
		}
	}
}
