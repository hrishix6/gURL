import {
	Component,
	HostBinding,
	type OnDestroy,
	type OnInit,
	signal,
} from "@angular/core";
import { getAppConfig } from "@/app.config";

@Component({
	selector: "gurl-status-beacon",
	template: `
        @switch (status()) {
            @case ("on") {
				<div class="status status-success"></div>
				<span class="text-sm text-success">Connected</span>
            }
            @case("off") {
				<div class="status status-error"></div>
				<span class="text-sm text-error">Disconnected</span>
            }
        }
    `,
})
export class GurlStatusBeacon implements OnInit, OnDestroy {
	@HostBinding("class")
	def = "flex items-center gap-2";

	private backendUrl: string = "";
	protected status = signal<"on" | "off">("on");
	protected intervalId: number | null = null;

	constructor() {
		this.backendUrl = getAppConfig().backend_url;
	}

	ngOnInit(): void {
		this.intervalId = setInterval(() => {
			this.healthCheck();
		}, 5000);
	}

	ngOnDestroy(): void {
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
	}

	private async healthCheck() {
		try {
			const res = await fetch(`${this.backendUrl}/health`);
			if (!res.ok) {
				throw new Error("health check failed");
			}
			this.status.set("on");
		} catch (error) {
			console.error(error);
			this.status.set("off");
		}
	}
}
