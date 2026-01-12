import { Component, effect, input, signal } from "@angular/core";

@Component({
	selector: "div[appResTextPreview]",
	template: `{{text()}}`,
})
export class ResponseTextPreview {
	src = input<string>();
	text = signal("");
	loading = signal(false);
	error = signal<string | null>(null);

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
			this.error.set(null);

			fetch(url, { signal: controller.signal, mode: "cors" })
				.then((r) => {
					if (!r.ok) {
						throw new Error(`HTTP ${r.status}`);
					}
					return r.text();
				})
				.then((t) => this.text.set(t))
				.catch((err) => {
					if (err.name !== "AbortError") {
						this.error.set(err.message);
					}
				})
				.finally(() => this.loading.set(false));
		});
	}
}
