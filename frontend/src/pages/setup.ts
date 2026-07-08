import {
	Component,
	type ElementRef,
	HostBinding,
	inject,
	viewChild,
} from "@angular/core";
import { getAppConfig } from "@/app.config";
import { SystemIconComponent } from "@/common/components/icon";
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
             <div>
                <label class="input w-full">
                <i gurl-icon [icon]="'Email'" [className]="'size-4'" ></i>
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
	imports: [SystemIconComponent],
})
export class FirstTimeSetupPage {
	@HostBinding("class")
	def = "h-screen flex flex-col gap-4 items-center justify-center";

	protected readonly appConfig = getAppConfig();
	protected emailRef =
		viewChild.required<ElementRef<HTMLInputElement>>("email");

	private readonly userAuthSvc = inject(UserAuthService);

	async handleFormSubmission(e: Event) {
		e.preventDefault();

		const payload: RegisterDTO = {
			email: this.emailRef().nativeElement.value,
		};

		await this.userAuthSvc.tryAdminUserSetup(payload);
	}
}
