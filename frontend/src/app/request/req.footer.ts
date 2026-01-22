import { Component, computed, HostBinding, inject } from "@angular/core";
import { Eye, EyeOff, LucideAngularModule } from "lucide-angular";
import { AppDropdown } from "@/common/components";
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
	selector: `app-req-footer`,
	template: `
        @switch (f.activeReqTab()) {
            @case ("req_headers") {
                <div class="flex-1 flex items-center">
                 <label class="label ml-auto">
                            <input type="checkbox" [checked]="f.headerSvc.bulkEditModeHeaders()" (change)="handleEditModeSwitch('req_headers')" class="toggle toggle-primary" />
                             Raw
                    </label>
                </div>
            }
            @case ('req_query'){
                   <div class="flex-1 flex items-center">
                    <label class="label ml-auto">
                            <input type="checkbox" [checked]="f.urlSvc.bulkEditModeQuery()" (change)="handleEditModeSwitch('req_query')" class="toggle toggle-primary" />
                             Raw
                    </label>
                     </div>
            }
            @case('req_cookies'){
                <div class="flex-1 flex items-center">
                    <label class="label ml-auto">
                            <input type="checkbox" [checked]="f.cookieSvc.bulkEditModeCookies()" (change)="handleEditModeSwitch('req_cookies')" class="toggle toggle-primary" />
                             Raw
                    </label>
                </div>
            }
            @case('req_auth'){
                 <div class="flex-1 flex gap-4 items-center">
                    @if(f.auth.activeAuth().id !== 'no_auth'){
                        <label class="label">
                            <input type="checkbox"  [checked]="f.auth.authEnabled()" (change)="f.toggleAuthEnabled()" class="checkbox checkbox-xs checkbox-primary xl:checkbox-sm" />
                             Enabled
                        </label>
                    }
                    <app-dropdown
                                [items]="reqAuthTypes"
                                [activeItem]="f.auth.activeAuth()"
                                [direction]="'top'"
                                [align]="'start'" 
                                [size]="'sm'"
                                [varient]="'soft'"
                                [primary]="false"
                                (onItemSelection)="handleActiveAuthSelection($event)"
                                >
                    </app-dropdown>
                    @if(["api_key"].includes(f.auth.activeAuth().id)){
                        <app-dropdown
                                [items]="apiKeyLocations"
                                [activeItem]="apiKeyLocationItem()!"
                                [direction]="'top'"
                                [align]="'start'" 
                                [size]="'sm'"
                                [varient]="'soft'"
                                [primary]="false"
                                (onItemSelection)="handleSetApiKeyLocation($event)"
                                >
                        </app-dropdown>
                    }

                    @if(["token"].includes(f.auth.activeAuth().id)){
                        <app-dropdown
                                    [items]="tokenAuthTypes"
                                    [activeItem]="tokenAuthTypeItem()!"
                                    [direction]="'top'"
                                    [align]="'start'" 
                                    [size]="'sm'"
                                    [varient]="'soft'"
                                    [primary]="false"
                                    (onItemSelection)="handleSetTokenAuthType($event)"
                                    >
                        </app-dropdown>
                    }
                
                    @if(["basic"].includes(f.auth.activeAuth().id)){
                        <label class="label ml-auto">
                            <input type="checkbox" [checked]="f.auth.basicAuthRawMode()" (change)="f.auth.toggleBasicAuthRawMode()" class="toggle toggle-primary" />
                             Raw
                        </label>
                    }
                </div>
            }
            @case('req_body'){
                <div class="flex-1 flex gap-4 items-center">
                <app-dropdown
                            [items]="reqBodyTypes"
                            [activeItem]="f.bodySvc.bodyType()"
                            [direction]="'top'"
                            [align]="'start'" 
                            [size]="'sm'"
                            [varient]="'soft'"
                            [primary]="false"
                            (onItemSelection)="handleActiveItemSelection($event)"
                            >
                </app-dropdown>
                @if(["urlencoded"].includes(f.bodySvc.bodyType().id)){
                        <label class="label ml-auto">
                            <input type="checkbox" [checked]="f.bodySvc.bulkEditModeUrlEncodedForm()" (change)="handleEditModeSwitch('req_body')" class="toggle toggle-primary" />
                             Raw
                    </label>
                }
            </div>
        }
    }
    `,
	imports: [LucideAngularModule, AppDropdown],
})
export class ReqFooter {
	readonly PreviewOpenIcon = Eye;
	readonly PreviewCloseIcon = EyeOff;

	readonly f = inject(FormService);
	readonly reqBodyTypes = REQ_BODY_TYPES;
	readonly reqAuthTypes = REQ_AUTH_TYPES;
	readonly tokenAuthTypes = TOKEN_AUTH_TYPES;
	readonly apiKeyLocations = API_KEY_LOCATION;

	apiKeyLocationItem = computed(() => {
		return this.apiKeyLocations.find(
			(x) => x.id === this.f.auth.apiKey().location,
		);
	});

	tokenAuthTypeItem = computed(() => {
		return this.tokenAuthTypes.find(
			(x) => x.id === this.f.auth.tokenAuth().type,
		);
	});

	@HostBinding("class")
	def = "flex text-xs p-2";

	handleActiveItemSelection(id: ReqBodyType) {
		this.f.setBodyType(id);
	}

	handleActiveAuthSelection(id: RequestAuthType) {
		this.f.setAuth(id);
	}

	handleSetApiKeyLocation(location: APIKeyLocation) {
		this.f.updateApiKey("location", location);
	}

	handleSetTokenAuthType(type: TokenAuthType) {
		this.f.updateTokenAuth("type", type);
	}

	handleEditModeSwitch(tabId: ReqTabId) {
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
