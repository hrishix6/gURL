import {
	Component,
	DestroyRef,
	type ElementRef,
	HostBinding,
	inject,
	signal,
	viewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ActivatedRoute } from "@angular/router";
import { getAppConfig } from "@/app.config";
import { DemoLoginCaptcha } from "@/common/components/demo.login.captcha";
import { SystemIconComponent } from "@/common/components/icon";
import { LOGIN_CODES_MSGS } from "@/constants";
import { UserAuthService } from "@/services";
import type { LoginRequestDTO } from "@/types";

@Component({
	selector: `gurl-login`,
	template: `
        <h2 class="text-primary text-2xl font-medium">
            gURL
            <span class="text-sm">{{ appConfig.appVersion }}</span>
        </h2>
		<div class="flex flex-col w-sm">
			<form class="flex flex-col gap-4" (submit)="handleFormSubmission($event)">
				@if(loginMessage()){
				<div class="alert alert-soft alert-{{loginMessageKind()}}">
					    @switch (loginMessageKind()) {
							@case ("error") {
								<i gurl-icon [icon]="'Failed'" [className]="'size-4'" ></i>
							}	

							@case('success'){
								<i gurl-icon [icon]="'Success'" [className]="'size-4'" ></i>
							}
						}
						<span>{{loginMessage()}}</span>
					</div>
				}
				<div>
					<label class="input w-full">
					<i gurl-icon [icon]="'User'" [className]="'size-4'" ></i>
					<input
						type="email"
						placeholder="example@email.com"
						title="Please fill out this field"
						required
						#email
					/>
					</label>
				</div>
				<input type="submit" class="btn btn-block btn-primary" value="Login" />
        	</form>
			@if(appConfig.demo_enabled){
				<gurl-demo-login />
			}
		</div>
    `,
	imports: [DemoLoginCaptcha, SystemIconComponent],
})
export class LoginPage {
	protected readonly appConfig = getAppConfig();
	private readonly userAuthSvc = inject(UserAuthService);
	private readonly destroyRef = inject(DestroyRef);
	private readonly activatedRoute = inject(ActivatedRoute);
	protected loginMessage = signal<string | null>(null);
	protected loginMessageKind = signal<"error" | "success" | null>("success");

	@HostBinding("class")
	def = "h-screen flex flex-col gap-4 items-center justify-center";

	constructor() {
		this.activatedRoute.queryParamMap
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (v) => {
					const code = v.get("code");
					if (code) {
						const failure = code.startsWith("err");
						const message = LOGIN_CODES_MSGS[code];
						this.loginMessageKind.set(failure ? "error" : "success");
						this.loginMessage.set(message);
					}
				},
			});
	}

	protected emailRef =
		viewChild.required<ElementRef<HTMLInputElement>>("email");

	async handleFormSubmission(e: Event) {
		e.preventDefault();

		const payload: LoginRequestDTO = {
			email: this.emailRef().nativeElement.value,
		};

		await this.userAuthSvc.tryLogin(payload);
	}
}
