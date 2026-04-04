import { Component, HostBinding } from "@angular/core";
import { RouterLink } from "@angular/router";
import { LucideAngularModule } from "lucide-angular";

@Component({
	selector: `gurl-settings`,
	template: `
        <h2>
            TODO: User Settings Page
        </h2>
        <a routerLink="/" class="">Back to Home</a>
    `,
	imports: [RouterLink, LucideAngularModule],
})
export class UserSettings {
	@HostBinding("class")
	def = "h-screen flex flex-col gap-4 items-center justify-center";
}
