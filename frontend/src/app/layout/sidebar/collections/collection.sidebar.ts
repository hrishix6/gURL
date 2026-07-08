import { Component, computed, inject, type OnInit } from "@angular/core";
import { SystemIconComponent } from "@/common/components/icon";
import { APP_COLLECTIONS_FETCH_ENTITY } from "@/constants";
import { AppService, GlobalModalsService } from "@/services";
import { FetchStateService } from "@/services/state/fetch.state.service";
import { GurlCollectionItem } from "./collection.item";

@Component({
	selector: `gurl-collections`,
	template: `
    @if(fState().loaded) {
        @if (appSvc.collections().length) {
          <section class="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
            @for (collection of appSvc.collections(); track collection.id) {
            <div gurl-collection-item [data]="collection" role="button"></div>
            }
          </section>
        } @else {
          <div class="flex items-center gap-2 my-2 justify-center text-sm opacity-25">
                    <i gurl-icon [icon]="'Empty'" [className]="'size-4'" ></i>
                    No items
           </div>
        }
    } 
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
  `,
	imports: [GurlCollectionItem, SystemIconComponent],
})
export class GurlCollections implements OnInit {
	protected readonly appSvc = inject(AppService);
	private readonly modalsSvc = inject(GlobalModalsService);

	private readonly fetchStateSvc = inject(FetchStateService);

	protected readonly fState = computed(() => {
		return this.fetchStateSvc.fetchState()[APP_COLLECTIONS_FETCH_ENTITY];
	});

	protected handleOpenAddCollectionModal() {
		this.modalsSvc.handleOpenCreateCollectionModal();
	}

	ngOnInit(): void {
		console.log(`collection sidebar ngOnInit`);
		const f = this.fetchStateSvc.init(APP_COLLECTIONS_FETCH_ENTITY);
		if (!f.attempts && !f.loading) {
			this.appSvc.fetchCollections();
		}
	}
}
