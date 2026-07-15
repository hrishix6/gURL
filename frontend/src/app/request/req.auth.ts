import { Component, inject } from "@angular/core";
import { GurlHighlightedInput } from "@/common/components/highlighted.input";
import { SystemIconComponent } from "@/common/components/icon";
import { REQ_AUTH_TYPES } from "@/constants";
import { AppService, FormService } from "@/services";

@Component({
	selector: "gurl-req-auth",
	template: `
     <div class="flex-1 flex flex-col overflow-y-auto p-1 relative">
        @switch (f.auth.activeAuth().id) {
            @case("no_auth") {
                <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
               
                     <i gurl-icon [icon]="'Empty'" [className]="'size-16 -z-10'" ></i>
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
                        [extractTokensFn]="f.reqFormExtractTokensCB"
                        [activeEnvSub]="appSvc.activeEnvChange$"
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
                        [activeEnvSub]="appSvc.activeEnvChange$"
                        [extractTokensFn]="f.reqFormExtractTokensCB"
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
                                [activeEnvSub]="appSvc.activeEnvChange$"
                                [placeHolder]="'token'"
                                [extractTokensFn]="f.reqFormExtractTokensCB"
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
                                [extractTokensFn]="f.reqFormExtractTokensCB"
                                [activeEnvSub]="appSvc.activeEnvChange$"
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
                            [activeEnvSub]="appSvc.activeEnvChange$"
                            [extractTokensFn]="f.reqFormExtractTokensCB"
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
	imports: [GurlHighlightedInput, SystemIconComponent],
})
export class RequestAuth {
	protected readonly reqAuthTypes = REQ_AUTH_TYPES;
	protected readonly f = inject(FormService);
	protected readonly appSvc = inject(AppService);
	protected handleTokenInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		this.f.updateTokenAuth("token", target.value);
	}
}
