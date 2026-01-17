import { Component, HostBinding, inject } from "@angular/core";
import { Ban, LucideAngularModule } from "lucide-angular";
import { REQ_AUTH_TYPES } from "@/constants";
import { FormService } from "@/services";

@Component({
	selector: "app-req-auth",
	template: `
     <div class="flex-1 flex flex-col overflow-y-auto p-1 relative">
        @switch (f.auth.activeAuth().id) {
            @case("no_auth") {
                <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
                    <lucide-angular [img]="NoneIcon" class="size-16 -z-10" />
                </div>
            }
            @case("basic") {
                <div class="flex flex-col gap-2.5">
                @if(f.auth.basicAuthRawMode()){
                    <textarea
                    class="textarea textarea-ghost textarea-primary bg-base-300 xl:textarea-lg w-full"
                    [value]="f.auth.rawBasicAuthText()"
                    readonly
                    >
                    </textarea>
                }
                @else {
                    <label class="input input-sm xl:input-md input-ghost bg-base-300 input-primary w-full">
                        User : 
                        <input type="text" class="grow"
                        [value]="f.auth.basicAuth().username"
                        (input)="f.updateBasicAuth('username', $event.target.value)"
                        />
                    </label>
                     <label class="input input-sm xl:input-md input-ghost bg-base-300 input-primary w-full">
                        Password : 
                        <input type="text" class="grow"
                        [value]="f.auth.basicAuth().password"
                        (input)="f.updateBasicAuth('password', $event.target.value)"
                        />
                    </label>
                }
                </div>
            }
            @case("token") {
                <textarea
                    class="textarea textarea-ghost textarea-primary bg-base-300 xl:textarea-lg w-full h-full"
                    placeholder="Token"
                    [value]="f.auth.tokenAuth().token"
                    (input)="handleTokenInput($event)"
                    >
                    </textarea>
            }
            @case("api_key") {
                <div class="flex flex-col gap-2.5">
                <label class="input input-sm xl:input-md input-ghost bg-base-300 input-primary w-full">
                        Key : 
                        <input type="text" class="grow"
                        [value]="f.auth.apiKey().key"
                        (input)="f.updateApiKey('key', $event.target.value)"
                        />
                    </label>
                     <label class="input input-sm xl:input-md input-ghost bg-base-300 input-primary w-full">
                        Value : 
                        <input type="text" class="grow"
                        [value]="f.auth.apiKey().value"
                        (input)="f.updateApiKey('value', $event.target.value)"
                        />
                    </label>
                </div>
            }
        }
     </div>
    `,
	imports: [LucideAngularModule],
})
export class RequestAuth {
	readonly NoneIcon = Ban;
	readonly reqAuthTypes = REQ_AUTH_TYPES;

	@HostBinding("class")
	defaultClass = "flex-1 flex flex-col overflow-hidden";

	readonly f = inject(FormService);

	handleTokenInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		this.f.updateTokenAuth("token", target.value);
	}
}
