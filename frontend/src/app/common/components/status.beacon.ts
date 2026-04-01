import {
	Component,
	HostBinding,
	type OnDestroy,
	type OnInit,
	signal,
} from "@angular/core";
import { RestClient } from "@/services";

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
	protected status = signal<"on" | "off">("on");
	protected intervalId: number | null = null;

	private readonly restClient = RestClient.getInstance();

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
			await this.restClient.get("health");
			this.status.set("on");
		} catch (error) {
			console.error(error);
			this.status.set("off");
		}
	}
}
