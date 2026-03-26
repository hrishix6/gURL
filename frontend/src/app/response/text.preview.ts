import { Component, effect, HostBinding, input, signal } from "@angular/core";
import { Alert } from "@/common/components/alert";
import type { Alert as AlertData } from "@/types";

@Component({
	selector: "div[gurl-res-text-preview]",
	template: `
		<textarea
		class="textarea textarea-lg focus:outline-0 textarea-ghost bg-base-300 flex-1"
		[value]="text()"
		readonly
		>
		</textarea>
		@if(errAlert()){
			<div class="absolute top-0 left-0 h-full w-full bg-base-300 flex items-center justify-center">
				<gurl-alert [data]="errAlert()!"  />
			</div>
		}
		@if(loading()){
			<div class="absolute top-0 left-0 h-full w-full bg-base-300 flex items-center justify-center">
				<span class="loading loading-ring text-primary loading-sm xl:loading-lg"></span>
			</div>
		}
	`,
	imports: [Alert],
})
export class ResponseTextPreview {
	@HostBinding("class")
	def = "relative";

	src = input<string>();
	text = signal("");
	loading = signal(false);
	errAlert = signal<AlertData | null>(null);

	constructor() {
		effect((onCleanup) => {
			const url = this.src();

			if (!url) {
				this.text.set("");
				return;
			}

			console.log(url);

			const controller = new AbortController();
			onCleanup(() => controller.abort());

			this.loading.set(true);
			this.errAlert.set(null);

			fetch(url, { signal: controller.signal, mode: "cors" })
				.then((r) => {
					if (!r.ok) {
						throw new Error(`HTTP ${r.status}`);
					}
					return r.text();
				})
				.then((t) => this.text.set(t))
				.catch((err) => {
					console.error(err);
					this.errAlert.set({
						id: "text_preview_alert",
						message: "failed to load response preview",
						type: "error",
					});
				})
				.finally(() => this.loading.set(false));
		});
	}
}
