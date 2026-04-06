import {
	Component,
	type ElementRef,
	HostBinding,
	type OnInit,
	signal,
	viewChild,
} from "@angular/core";
import { CF_TURNSTILE_SCRIPT_SRC, CF_TURNSTILE_SITE_KEY } from "@/constants";

@Component({
	selector: `gurl-demo-login`,
	template: `
        @if(cfScriptLoaded()){
        <div class="divider">OR</div>
		<form class="flex flex-col gap-2" method="post" action="/auth/demo-session">
				<input type="hidden" name="token" value="" #CFtoken/>
				<input type="submit" class="hidden" #trydemoformtrigger />
				<button type="button" class="btn btn-block"     
						[disabled]="disableRetryBtn()"
						(click)="handleDemo()">
					Try Demo
				</button>
				<div id="turnstile-container"></div>
		</form>
       }
    `,
})
export class DemoLoginCaptcha implements OnInit {
	@HostBinding("class")
	def = "flex flex-col";

	protected readonly cfScriptLoaded = signal<boolean>(false);
	private readonly trydemoformtrigger =
		viewChild.required<ElementRef<HTMLButtonElement>>("trydemoformtrigger");
	private readonly cfTokenEl =
		viewChild.required<ElementRef<HTMLInputElement>>("CFtoken");
	protected readonly disableRetryBtn = signal<boolean>(false);

	handleDemo() {
		this.disableRetryBtn.set(true);
		const widgetId = window.turnstile.render("#turnstile-container", {
			sitekey: CF_TURNSTILE_SITE_KEY,
			size: "flexible",
			retry: "never",
			callback: (token: string) => {
				this.cfTokenEl().nativeElement.value = token;
				setTimeout(() => {
					this.trydemoformtrigger().nativeElement?.click();
					window.turnstile.remove(widgetId);
				}, 1500);
			},
		});
	}

	ngOnInit(): void {
		this.loadCFScript();
	}

	loadCFScript() {
		return new Promise<void>((resolve, reject) => {
			if (this.cfScriptLoaded()) {
				return resolve();
			}

			const scriptEl = document.createElement("script");

			scriptEl.src = CF_TURNSTILE_SCRIPT_SRC;
			scriptEl.defer = true;
			scriptEl.async = true;

			scriptEl.onload = () => {
				this.cfScriptLoaded.set(true);
				resolve();
			};

			scriptEl.onerror = () => {
				console.error("failed to load CF script");
				reject(`failed to load ${CF_TURNSTILE_SCRIPT_SRC}`);
			};

			document.head.appendChild(scriptEl);
		});
	}
}
