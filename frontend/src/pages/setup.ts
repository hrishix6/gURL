import {
	Component,
	type ElementRef,
	HostBinding,
	inject,
	signal,
	viewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { CircleX, Key, LucideAngularModule, Mail, User } from "lucide-angular";
import { getAppConfig } from "@/app.config";
import { UserAuthService } from "@/services";
import type { RegisterDTO } from "@/types";

@Component({
	selector: `gurl-first-time-setup`,
	template: `
        <h2 class="text-primary text-2xl font-medium">
            gURL
            <span class="text-sm">{{ appConfig.appVersion }}</span>
        </h2>
        <p class="text-sm">
            Create an admin user
        </p>
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
            <input type="submit" class="btn btn-block btn-primary" value="Create" />
        </form>
    `,
	imports: [LucideAngularModule],
})
export class FirstTimeSetupPage {
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

	private readonly userAuthSvc = inject(UserAuthService);
	private readonly router = inject(Router);

	async handleFormSubmission(e: Event) {
		e.preventDefault();

		const payload: RegisterDTO = {
			email: this.emailRef().nativeElement.value,
		};

		await this.userAuthSvc.tryAdminUserSetup(payload);
	}
}
