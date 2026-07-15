import {
	Component,
	computed,
	HostBinding,
	inject,
	input,
	signal,
} from "@angular/core";
import type { models } from "@wailsjs/go/models";
import { getAppConfig } from "@/app.config";
import { SystemIconComponent } from "@/common/components/icon";
import { AppService, GlobalModalsService, UserAuthService } from "@/services";
import { FetchStateService } from "@/services/state/fetch.state.service";
import type { MockCallingInfo } from "@/types";
import { GurlMockItem } from "./mock.item";

@Component({
	selector: `div[gurl-mock-server-item]`,
	template: `
    <div class="flex items-center gap-2 p-2 bg-base-300 rounded-box">
      <div
        class="flex flex-1 items-center gap-2"
      >
          @if(data().mockServerEnabled){
            <i gurl-icon [icon]="'MockServer'" [className]="'size-4 text-primary'" ></i>
          }@else {
            <i gurl-icon [icon]="'MockServer'" [className]="'size-4'" ></i>
          }
        <p class="flex-1 text-sm truncate">{{ data().name }}</p>
	  </div>
      <div class="flex items-center gap-2">
          @if(data().mockServerKey){
                @if(data().mockServerEnabled) {
                     <button class="btn btn-sm btn-square btn-ghost" (click)="handleStopMockServer()">
                            <i gurl-icon [icon]="'Stop'" [className]="'size-4'" ></i>
                    </button>
                    <button class="btn btn-sm btn-square btn-ghost" (click)="handleToggleMockServerInfo()">
                         <i gurl-icon [icon]="'Info'" [className]="'size-4'" ></i>
                    </button>
                } @else {
                    <button class="btn btn-sm btn-square btn-ghost" (click)="handleStartMockServer()">
                            <i gurl-icon [icon]="'Start'" [className]="'size-4'" ></i>
                    </button>
                }
          }@else {
                <button class="btn btn-sm btn-square btn-ghost" (click)="handleCreateMockServer()">
                        <i gurl-icon [icon]="'Start'" [className]="'size-4'" ></i>
                </button>
          }
      </div>
	  <button class="btn btn-sm btn-square btn-ghost" (click)="toggleOpen()">
			@if(isOpen()) {
        		<i gurl-icon [icon]="'ChevronUp'" [className]="'size-4'" ></i>
       		 }@else {
        		<i gurl-icon [icon]="'ChevronDown'" [className]="'size-4'" ></i>
       	 }
	  </button>
    </div>
     @if(isOpen()) {
        @if(fState().loaded) {
             <section class="flex flex-col gap-1">
                @if (mockItems().length) 
                    { 
                        @for (item of mockItems(); track item.id) { 
                            <div gurl-mock-item [data]="item" (onShowInfo)="handleShowMockItemInfo($event)"></div>
                        } 
                    }   
                @else {
                <div class="flex items-center gap-2 my-2 justify-center text-sm opacity-25">
                    <i gurl-icon [icon]="'Empty'" [className]="'size-4'" ></i>
                    No items
                </div>
                }
            </section>
        }
        @if(fState().loading) {
            <div class="flex items-center gap-2 my-2 justify-center">
                <span class="loading loading-bars loading-xs text-primary"></span>
            </div>
        }
        @if(fState().error) {
            <div class="flex flex-col gap-2 items-center my-2 justify-center">
                <div class="flex items-center justify-center opacity-30 gap-2 text-sm">
                    <i gurl-icon [icon]="'Failed'" [className]="'size-4'" ></i>
                    Failed to load data.
                </div>
            </div>
        }
    }
  `,
	imports: [SystemIconComponent, GurlMockItem],
})
export class GurlMockServerItem {
	@HostBinding("class")
	def = "flex flex-col gap-1";

	data = input.required<models.CollectionDTO>();

	protected readonly config = getAppConfig();
	protected readonly userAuthSvc = inject(UserAuthService);

	protected mockItems = computed(() => {
		return this.appSvc
			.mockItems()
			.filter((x) => x.collectionId === this.data().id);
	});

	protected readonly appSvc = inject(AppService);
	protected readonly modalsSvc = inject(GlobalModalsService);
	private readonly fetchStateSvc = inject(FetchStateService);

	protected fState = computed(() => {
		return this.fetchStateSvc.fetchState()[
			this.fetchStateSvc.mocksKey(this.data().id)
		];
	});

	protected isOpen = signal<boolean>(false);

	protected toggleOpen() {
		this.isOpen.update((x) => !x);
		const collectionId = this.data().id;
		const f = this.fetchStateSvc.init(
			this.fetchStateSvc.mocksKey(collectionId),
		);
		console.log(JSON.stringify(f));
		if (!f.attempts && !f.loading) {
			console.log(`fetching mock items of ${collectionId}`);
			this.appSvc.fetchMockItems(collectionId);
		}
	}

	protected handleCreateMockServer() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.appSvc.createMockServer(this.data().id);
	}

	protected handleStopMockServer() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.appSvc.updateMockServer(this.data().id, false);
	}
	protected handleStartMockServer() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.appSvc.updateMockServer(this.data().id, true);
	}

	protected handleToggleMockServerInfo() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();

		const serverInfo: MockCallingInfo = {
			url: `${this.config.mockSrvBaseUrl}/${this.data().id}`,
			auth: {
				key: "x-gurl-mock-key",
				val: this.data().mockServerKey,
			},
		};

		this.modalsSvc.handleOpenMockInfoModal(serverInfo);
	}

	protected handleShowMockItemInfo({ id, path }: { id: string; path: string }) {
		const serverInfo: MockCallingInfo = {
			url: `${this.config.mockSrvBaseUrl}/${this.data().id}${path}`,
			auth: {
				key: "x-gurl-mock-key",
				val: this.data().mockServerKey,
			},
			match: {
				key: "x-gurl-mock-id",
				val: id,
			},
		};

		this.modalsSvc.handleOpenMockInfoModal(serverInfo);
	}
}
