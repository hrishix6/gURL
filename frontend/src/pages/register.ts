import {
	Component,
	type ElementRef,
	HostBinding,
	inject,
	signal,
	viewChild,
} from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { CircleX, Key, LucideAngularModule, Mail, User } from "lucide-angular";
import { getAppConfig } from "@/app.config";
import { UserAuthService } from "@/services";
import type { RegisterDTO } from "@/types";

@Component({
	selector: `gurl-register`,
	template: `
        <h2 class="text-primary text-2xl font-medium">
            gURL
            <span class="text-sm">{{ appConfig.appVersion }}</span>
        </h2>
        <form class="flex flex-col gap-4 w-96" (submit)="handleFormSubmission($event)">
            @if(loginErr()){
               <div class="alert alert-soft alert-error">
                    <lucide-angular [img]="FailedIcon" class="size-4" />
                     <span>{{loginErr()}}</span>
                </div>
            }
             <div>
                <label class="input w-full">
                <lucide-angular [img]="EmailIcon" class="size-4" />
                <input
                    type="email"
                    required
                    placeholder="example@email.com"
                    title="Please enter valid email"
                    #email
                />
                </label>
            </div>
            <div>
                <label class="input w-full">
                <lucide-angular [img]="UserIcon" class="size-4" />
                <input
                    type="text"
                    required
                    placeholder="Username"
                    pattern="[a-z0-9]*"
                    minlength="3"
                    maxlength="15"
                    title="Only lower case letters & numbers"
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
                    minlength="3"
                    maxlength="100"
                    title="must be within 3-100 characters"
                    #password
                />
                </label>
            </div>
            <input type="submit" class="btn btn-block btn-primary" value="Register" />
        </form>
        <p class="text-sm">
          Already have account? <a routerLink="/login" class="mx-1 underline hover:text-primary hover:cursor-pointer">Login</a>  
        </p>
    `,
	imports: [RouterLink, LucideAngularModule],
})
export class RegisterPage {
	@HostBinding("class")
	def = "h-screen flex flex-col gap-4 items-center justify-center";

	protected readonly appConfig = getAppConfig();
	protected readonly UserIcon = User;
	protected readonly EmailIcon = Mail;
	protected readonly PassIcon = Key;
	protected readonly FailedIcon = CircleX;

	protected loginErr = signal<string | null>(null);

	protected emailRef =
		viewChild.required<ElementRef<HTMLInputElement>>("email");
	protected usernameRef =
		viewChild.required<ElementRef<HTMLInputElement>>("username");
	protected passwordRef =
		viewChild.required<ElementRef<HTMLInputElement>>("password");

	private readonly userAuthSvc = inject(UserAuthService);
	private readonly router = inject(Router);

	async handleFormSubmission(e: Event) {
		e.preventDefault();

		const payload: RegisterDTO = {
			username: this.usernameRef().nativeElement.value,
			password: this.passwordRef().nativeElement.value,
			email: this.emailRef().nativeElement.value,
		};

		const success = await this.userAuthSvc.tryRegister(payload);

		if (!success) {
			this.loginErr.set("failed to sign up");
			return;
		}

		this.router.navigate(["/login"], { replaceUrl: true });
	}
}
