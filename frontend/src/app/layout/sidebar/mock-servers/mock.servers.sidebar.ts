import { Component, computed, inject } from "@angular/core";
import { SystemIconComponent } from "@/common/components/icon";
import { APP_COLLECTIONS_FETCH_ENTITY } from "@/constants";
import { AppService } from "@/services";
import { FetchStateService } from "@/services/state/fetch.state.service";
import { GurlMockServerItem } from "./mock.server.item";

@Component({
	selector: `gurl-mock-servers`,
	template: `
    @if(fState().loaded) {
         @if (appSvc.collections().length) {
            <div class="flex-1 flex flex-col overflow-y-auto gap-1 p-2">
            @for (item of appSvc.collections(); track item.id) {
            <div
                gurl-mock-server-item
                [data]="item"
            >
            </div>
            }
            </div>
            }@else {
            <div class="flex items-center gap-2 my-2 justify-center text-sm opacity-25">
                    <i gurl-icon [icon]="'Empty'" [className]="'size-4'" ></i>
                    No items
           </div>
        }
    } @else {
        @if(fState().loading){
            <div class="flex items-center gap-2 my-2 justify-center">
                <span class="loading loading-bars loading-xs text-primary"></span>
            </div>
        } 
        @if(fState().error){
            <div class="flex-1 flex flex-col">
                <div class="flex items-center justify-center opacity-30 my-2 gap-2 text-sm">
                    <i gurl-icon [icon]="'Failed'" [className]="'size-4'" ></i>
                    Failed to load data.
                </div>
                <div class="flex-1 flex flex-col justify-center items-center opacity-30">
                    <button class="btn btn-lg btn-ghost" (click)="appSvc.fetchCollections()">
                            <i gurl-icon [icon]="'Retry'" [className]="'size-8'" ></i>
                            <span class="text-lg">Retry</span>
                    </button>
               </div>
            </div>  
        }
    }
   
  `,
	imports: [SystemIconComponent, GurlMockServerItem],
})
export class GurlMockServers {
	protected appSvc = inject(AppService);
	private readonly fetchStateSvc = inject(FetchStateService);

	protected readonly fState = computed(() => {
		return this.fetchStateSvc.fetchState()[APP_COLLECTIONS_FETCH_ENTITY];
	});
}
