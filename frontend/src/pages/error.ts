import {
	Component,
	DestroyRef,
	HostBinding,
	inject,
	signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { getAppConfig } from "@/app.config";
import { SystemIconComponent } from "@/common/components/icon";
import { LOGIN_CODES_MSGS } from "@/constants";

@Component({
	selector: `gurl-login`,
	template: `
        <h2 class="text-primary text-2xl font-medium">
            gURL
            <span class="text-sm">{{ appConfig.appVersion }}</span>
        </h2>
		<div class="flex flex-col gap-4 w-sm">
			@if(loginMessage()){
				<div class="alert alert-soft alert-{{loginMessageKind()}}">
					@switch (loginMessageKind()) {
							@case("error"){
								<i gurl-icon [icon]="'Failed'" [className]="'size-4'" ></i>
							}
							@case ("success") {
								<i gurl-icon [icon]="'Success'" [className]="'size-4'" ></i>
							}
						}
						<span>{{loginMessage()}}</span>
				</div>
                @switch (code()) {
                    @case ("ok_session_expired") {
                    <button class="btn btn-block btn-soft btn-primary" (click)="handleLogin()">
                            Login
                    </button>
                    }
                    @case ("err_server_disconnected") {
                    <button class="btn btn-block btn-soft btn-primary" (click)="handleRefresh()">
                        Refresh
                    </button>
                    }
                    @default {
                    <button class="btn btn-block btn-soft btn-primary" (click)="handleRefresh()">
                        Home
                    </button>
                    }
                }
                
			}
		</div>
    `,
	imports: [SystemIconComponent],
})
export class ErrorPage {
	protected readonly appConfig = getAppConfig();
	private readonly destroyRef = inject(DestroyRef);
	private readonly router = inject(Router);
	private readonly activatedRoute = inject(ActivatedRoute);

	protected readonly code = signal<string>("");
	protected loginMessage = signal<string | null>(null);
	protected loginMessageKind = signal<"error" | "success" | "warning" | null>(
		"success",
	);

	@HostBinding("class")
	def = "h-screen flex flex-col gap-4 items-center justify-center";

	constructor() {
		this.activatedRoute.queryParamMap
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (v) => {
					const code = v.get("code");
					if (code) {
						this.code.set(code);
						const failure = code.startsWith("err");
						const message = LOGIN_CODES_MSGS[code];
						this.loginMessageKind.set(failure ? "error" : "success");
						this.loginMessage.set(message);
					} else {
						this.loginMessageKind.set("warning");
						this.loginMessage.set("Nothing to see here");
					}
				},
			});
	}

	handleRefresh() {
		this.router.navigate(["/"], { replaceUrl: true });
	}

	handleLogin() {
		this.router.navigate(["/login"], { replaceUrl: true });
	}
}
