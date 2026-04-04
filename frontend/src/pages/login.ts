import {
	Component,
	DestroyRef,
	type ElementRef,
	HostBinding,
	inject,
	OnInit,
	signal,
	viewChild,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CircleCheck, CircleX, Key, LucideAngularModule, User } from "lucide-angular";
import { getAppConfig } from "@/app.config";
import { UserAuthService } from "@/services";
import type { LoginRequestDTO } from "@/types";
import { LOGIN_CODES_MSGS } from "@/constants";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";

@Component({
	selector: `gurl-login`,
	template: `
        <h2 class="text-primary text-2xl font-medium">
            gURL
            <span class="text-sm">{{ appConfig.appVersion }}</span>
        </h2>
        <form class="flex flex-col gap-4 w-sm" (submit)="handleFormSubmission($event)">
            @if(loginMessage()){
               <div class="alert alert-soft alert-{{loginMessageKind()}}">
                    <lucide-angular [img]="loginMessageKind() == 'error' ? FailedIcon: PassIcon "class="size-4" />
                     <span>{{loginMessage()}}</span>
                </div>
            }
            <div>
                <label class="input w-full">
                <lucide-angular [img]="UserIcon" class="size-4" />
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
    `,
	imports: [LucideAngularModule],
})
export class LoginPage {
	protected readonly appConfig = getAppConfig();
	private readonly userAuthSvc = inject(UserAuthService);
    private readonly destroyRef = inject(DestroyRef);

	private readonly activatedRoute = inject(ActivatedRoute);

	protected readonly UserIcon = User;
	protected readonly PassIcon = CircleCheck;
	protected readonly FailedIcon = CircleX;

	protected loginMessage = signal<string | null>(null);
    protected loginMessageKind = signal<"error" | "success" | null>("success")

	@HostBinding("class")
	def = "h-screen flex flex-col gap-4 items-center justify-center";

    constructor() {
        this.activatedRoute.queryParamMap
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
            next: (v)=> {
                const code = v.get("code");
                if(code) {
                    const failure = code.startsWith("err");
                    const message = LOGIN_CODES_MSGS[code]
                    this.loginMessageKind.set(failure? "error": "success");
                    this.loginMessage.set(message);
                }
            }
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
