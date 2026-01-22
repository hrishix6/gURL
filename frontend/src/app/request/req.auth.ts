import { Component, HostBinding, inject } from "@angular/core";
import { Ban, LucideAngularModule } from "lucide-angular";
import { HighlightedInput } from "@/common/components/highlighted.input";
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
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">User</legend>
                        <div highlightedInp
                        [placeHolder]="'name'"
                        [disabled]="false"
                        [text]="f.auth.basicAuth().username"
                        (onInput)="f.updateBasicAuth('username', $event)"
                        >
                        </div>
                    </fieldset>
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Password</legend>
                        <div highlightedInp
                        [placeHolder]="'password'"
                        [disabled]="false"
                        [text]="f.auth.basicAuth().password"
                        (onInput)="f.updateBasicAuth('password', $event)"
                        >
                        </div>
                    </fieldset>
                }
                </div>
            }
            @case("token") {
                <!-- <textarea
                    class="textarea textarea-ghost textarea-primary bg-base-300 xl:textarea-lg w-full h-full"
                    placeholder="Token"
                    [value]="f.auth.tokenAuth().token"
                    (input)="handleTokenInput($event)"
                    >
                </textarea> -->
                <fieldset class="fieldset">
                            <legend class="fieldset-legend">Token</legend>
                            <div highlightedInp
                                [placeHolder]="'token'"
                                [disabled]="false"
                                [text]="f.auth.tokenAuth().token"
                                (onInput)="f.updateTokenAuth('token', $event)">
                            </div>
                </fieldset>
            }
            @case("api_key") {
                <div class="flex flex-col gap-2.5">
                    <!-- <label class="input input-sm xl:input-md input-ghost bg-base-300 input-primary w-full">
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
                    </label> -->
                    <fieldset class="fieldset">
                            <legend class="fieldset-legend">Key</legend>
                            <div highlightedInp
                                [placeHolder]="'key'"
                                [disabled]="false"
                                [text]="f.auth.apiKey().key"
                                (onInput)="f.updateApiKey('key', $event)"
                                >
                            </div>
                    </fieldset>
                    <fieldset class="fieldset">
                            <legend class="fieldset-legend">Value</legend>
                            <div highlightedInp
                            [placeHolder]="'value'"
                            [disabled]="f.auth.apiKey().key == ''"
                            [text]="f.auth.apiKey().value"
                            (onInput)="f.updateApiKey('value', $event)"
                            >
                            </div>
                    </fieldset>
                </div>
            }
        }
     </div>
    `,
	imports: [LucideAngularModule, HighlightedInput],
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
