import { Component, computed, HostBinding, inject } from "@angular/core";
import { Eye, EyeOff, LucideAngularModule } from "lucide-angular";
import { GurlDropdown } from "@/common/components";
import {
	API_KEY_LOCATION,
	REQ_AUTH_TYPES,
	REQ_BODY_TYPES,
	TOKEN_AUTH_TYPES,
} from "@/constants";
import { FormService } from "@/services";
import type {
	APIKeyLocation,
	ReqBodyType,
	ReqTabId,
	RequestAuthType,
	TokenAuthType,
} from "@/types";

@Component({
	selector: `gurl-req-footer`,
	template: `
        @switch (f.activeReqTab()) {
            @case ("req_headers")
            {
                @if(f.tabType() === 'req'){
                <div class="flex-1 flex items-center">
                 <label class="label ml-auto">
                            <input type="checkbox" [checked]="f.headerSvc.bulkEditModeHeaders()" (change)="handleEditModeSwitch('req_headers')" class="toggle toggle-primary" />
                             Raw
                    </label>
                </div>
                }
            }
            @case ('req_query'){
                @if(f.tabType() === 'req'){
                   <div class="flex-1 flex items-center">
                    <label class="label ml-auto">
                            <input type="checkbox" [checked]="f.urlSvc.bulkEditModeQuery()" (change)="handleEditModeSwitch('req_query')" class="toggle toggle-primary" />
                             Raw
                    </label>
                     </div>
                }
            }
            @case('req_cookies'){
                @if(f.tabType() === 'req'){
                <div class="flex-1 flex items-center">
                    <label class="label ml-auto">
                            <input type="checkbox" [checked]="f.cookieSvc.bulkEditModeCookies()" (change)="handleEditModeSwitch('req_cookies')" class="toggle toggle-primary" />
                             Raw
                    </label>
                </div>
                }
            }
            @case('req_auth'){
                 <div class="flex-1 flex gap-4 items-center">
                    @if(f.tabType() === 'req'){
                    @if(f.auth.activeAuth().id !== 'no_auth'){
                        <label class="label">
                            <input type="checkbox"  [checked]="f.auth.authEnabled()" (change)="f.toggleAuthEnabled()" class="checkbox checkbox-xs checkbox-primary xl:checkbox-sm" />
                             Enabled
                        </label>
                    }
                }
                    <gurl-dropdown
                                [items]="reqAuthTypes"
                                [activeItem]="f.auth.activeAuth()"
                                [disabled]="f.tabType() === 'req_example'"
                                [direction]="'top'"
                                [align]="'start'" 
                                [size]="'sm'"
                                [varient]="'soft'"
                                [primary]="false"
                                (onItemSelection)="handleActiveAuthSelection($event)"
                                >
                    </gurl-dropdown>
                    @if(["api_key"].includes(f.auth.activeAuth().id)){
                        <gurl-dropdown
                                [items]="apiKeyLocations"
                                [activeItem]="apiKeyLocationItem()!"
                                [disabled]="f.tabType() === 'req_example'"
                                [direction]="'top'"
                                [align]="'start'" 
                                [size]="'sm'"
                                [varient]="'soft'"
                                [primary]="false"
                                (onItemSelection)="handleSetApiKeyLocation($event)"
                                >
                        </gurl-dropdown>
                    }

                    @if(["token"].includes(f.auth.activeAuth().id)){
                        <gurl-dropdown
                                    [items]="tokenAuthTypes"
                                    [activeItem]="tokenAuthTypeItem()!"
                                    [disabled]="f.tabType() === 'req_example'"
                                    [direction]="'top'"
                                    [align]="'start'" 
                                    [size]="'sm'"
                                    [varient]="'soft'"
                                    [primary]="false"
                                    (onItemSelection)="handleSetTokenAuthType($event)"
                                    >
                        </gurl-dropdown>
                    }
                @if(f.tabType() === 'req'){
                    @if(["basic"].includes(f.auth.activeAuth().id)){
                        <label class="label ml-auto">
                            <input type="checkbox" [checked]="f.auth.basicAuthRawMode()" (change)="f.auth.toggleBasicAuthRawMode()" class="toggle toggle-primary" />
                             Raw
                        </label>
                    }
                }
                </div>
            }
            @case('req_body'){
                <div class="flex-1 flex">
                <gurl-dropdown
                            [items]="reqBodyTypes"
                            [activeItem]="f.bodySvc.bodyType()"
                            [direction]="'top'"
                            [align]="'start'" 
                            [size]="'sm'"
                            [varient]="'soft'"
                            [disabled]="f.tabType() === 'req_example'"
                            [primary]="false"
                            (onItemSelection)="handleActiveItemSelection($event)"
                            >
                </gurl-dropdown>
                @if(f.tabType() === 'req'){
                @if(["urlencoded"].includes(f.bodySvc.bodyType().id)){
                    <label class="label ml-auto self-end">
                            <input type="checkbox" [checked]="f.bodySvc.bulkEditModeUrlEncodedForm()" (change)="handleEditModeSwitch('req_body')" class="toggle toggle-primary" />
                             Raw
                    </label>
                    }
                }
            </div>
        }
    }
    `,
	imports: [LucideAngularModule, GurlDropdown],
})
export class ReqFooter {
	@HostBinding("class")
	def = "flex text-xs px-2 py-1";

	protected readonly PreviewOpenIcon = Eye;
	protected readonly PreviewCloseIcon = EyeOff;

	protected readonly f = inject(FormService);
	protected readonly reqBodyTypes = REQ_BODY_TYPES;
	protected readonly reqAuthTypes = REQ_AUTH_TYPES;
	protected readonly tokenAuthTypes = TOKEN_AUTH_TYPES;
	protected readonly apiKeyLocations = API_KEY_LOCATION;

	protected apiKeyLocationItem = computed(() => {
		return this.apiKeyLocations.find(
			(x) => x.id === this.f.auth.apiKey().location,
		);
	});

	protected tokenAuthTypeItem = computed(() => {
		return this.tokenAuthTypes.find(
			(x) => x.id === this.f.auth.tokenAuth().type,
		);
	});

	protected handleActiveItemSelection(id: ReqBodyType) {
		this.f.setBodyType(id);
	}

	protected handleActiveAuthSelection(id: RequestAuthType) {
		this.f.setAuth(id);
	}

	protected handleSetApiKeyLocation(location: APIKeyLocation) {
		this.f.updateApiKey("location", location);
	}

	protected handleSetTokenAuthType(type: TokenAuthType) {
		this.f.updateTokenAuth("type", type);
	}

	protected handleEditModeSwitch(tabId: ReqTabId) {
		switch (tabId) {
			case "req_headers": {
				return this.f.headerSvc.toggleEditModeHeaders();
			}
			case "req_query": {
				return this.f.urlSvc.toggleEditModeQuery();
			}
			case "req_body": {
				return this.f.bodySvc.toggleEditModeUrlEncodedForm();
			}
			case "req_cookies": {
				return this.f.cookieSvc.toggleEditModeCookies();
			}
		}
	}
}
