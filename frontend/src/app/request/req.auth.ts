import { Component, HostBinding, inject } from "@angular/core";
import { Ban, LucideAngularModule } from "lucide-angular";
import { GurlHighlightedInput } from "@/common/components/highlighted.input";
import { REQ_AUTH_TYPES } from "@/constants";
import { FormService } from "@/services";

@Component({
	selector: "gurl-req-auth",
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
                        <div gurl-highlighted-input
                        [placeHolder]="'name'"
                        [disabled]="false"
                        [readonly]="f.tabType() === 'req_example'"
                        [text]="f.auth.basicAuth().username"
                        (onInput)="f.updateBasicAuth('username', $event)"
                        >
                        </div>
                    </fieldset>
                    <fieldset class="fieldset">
                        <legend class="fieldset-legend">Password</legend>
                        <div gurl-highlighted-input
                        [placeHolder]="'password'"
                        [disabled]="false"
                        [readonly]="f.tabType() === 'req_example'"
                        [text]="f.auth.basicAuth().password"
                        (onInput)="f.updateBasicAuth('password', $event)"
                        >
                        </div>
                    </fieldset>
                }
                </div>
            }
            @case("token") {
                <fieldset class="fieldset">
                            <legend class="fieldset-legend">Token</legend>
                            <div gurl-highlighted-input
                                [placeHolder]="'token'"
                                [disabled]="false"
                                [readonly]="f.tabType() === 'req_example'"
                                [text]="f.auth.tokenAuth().token"
                                (onInput)="f.updateTokenAuth('token', $event)">
                            </div>
                </fieldset>
            }
            @case("api_key") {
                <div class="flex flex-col gap-2.5">
                    <fieldset class="fieldset">
                            <legend class="fieldset-legend">Key</legend>
                            <div gurl-highlighted-input
                                [placeHolder]="'key'"
                                [disabled]="false"
                                [readonly]="f.tabType() === 'req_example'"
                                [text]="f.auth.apiKey().key"
                                (onInput)="f.updateApiKey('key', $event)"
                                >
                            </div>
                    </fieldset>
                    <fieldset class="fieldset">
                            <legend class="fieldset-legend">Value</legend>
                            <div gurl-highlighted-input
                            [placeHolder]="'value'"
                            [disabled]="f.auth.apiKey().key == ''"
                            [readonly]="f.tabType() === 'req_example'"
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
	imports: [LucideAngularModule, GurlHighlightedInput],
})
export class RequestAuth {
	@HostBinding("class")
	defaultClass = "flex-1 flex flex-col overflow-hidden";

	protected readonly NoneIcon = Ban;
	protected readonly reqAuthTypes = REQ_AUTH_TYPES;

	protected readonly f = inject(FormService);

	protected handleTokenInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		this.f.updateTokenAuth("token", target.value);
	}
}
