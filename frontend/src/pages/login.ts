import {
	Component,
	type ElementRef,
	HostBinding,
	inject,
	signal,
	viewChild,
} from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { CircleX, Key, LucideAngularModule, User } from "lucide-angular";
import { getAppConfig } from "@/app.config";
import { UserAuthService } from "@/services";
import type { LoginRequestDTO } from "@/types";

@Component({
	selector: `gurl-login`,
	template: `
        <h2 class="text-primary text-2xl font-medium">
            gURL
            <span class="text-sm">{{ appConfig.appVersion }}</span>
        </h2>
        <form class="flex flex-col gap-4 w-sm" (submit)="handleFormSubmission($event)">
            @if(loginErr()){
               <div class="alert alert-soft alert-error">
                    <lucide-angular [img]="FailedIcon" class="size-4" />
                     <span>{{loginErr()}}</span>
                </div>
            }
            <div>
                <label class="input w-full">
                <lucide-angular [img]="UserIcon" class="size-4" />
                <input
                    type="text"
                    placeholder="Username"
                    title="Please fill out this field"
                    required
                    #username
                />
                </label>
            </div>
            <div>
                <label class="input w-full">
                <lucide-angular [img]="PassIcon" class="size-4" />
                <input
                    type="password"
                    required
                    placeholder="Password"
                    title="Please fill out this field"
                    #password
                />
                </label>
            </div>
            <input type="submit" class="btn btn-block btn-primary" value="Login" />
        </form>
        <p class="text-sm">
          New to the app? <a routerLink="/register" class="mx-1 underline hover:text-primary hover:cursor-pointer">Sign up</a>  
        </p>
    `,
	imports: [LucideAngularModule, RouterLink],
})
export class LoginPage {
	protected readonly appConfig = getAppConfig();
	private readonly userAuthSvc = inject(UserAuthService);
	private readonly router = inject(Router);

	protected readonly UserIcon = User;
	protected readonly PassIcon = Key;
	protected readonly FailedIcon = CircleX;

	protected loginErr = signal<string | null>(null);

	@HostBinding("class")
	def = "h-screen flex flex-col gap-4 items-center justify-center";

	protected usernameRef =
		viewChild.required<ElementRef<HTMLInputElement>>("username");
	protected passwordRef =
		viewChild.required<ElementRef<HTMLInputElement>>("password");

	async handleFormSubmission(e: Event) {
		e.preventDefault();

		const payload: LoginRequestDTO = {
			username: this.usernameRef().nativeElement.value,
			password: this.passwordRef().nativeElement.value,
		};

		const success = await this.userAuthSvc.tryLogin(payload);

		if (!success) {
			this.loginErr.set("Invalid credentials");
			return;
		}

		this.router.navigate(["/"], { replaceUrl: true });
	}
}
