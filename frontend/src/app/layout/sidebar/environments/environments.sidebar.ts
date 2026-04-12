import { Component, HostBinding, inject, signal } from "@angular/core";
import { CirclePlus, Info, LucideAngularModule, Search } from "lucide-angular";
import { AppService, GlobalModalsService } from "@/services";
import { GurlEnvironmentItem } from "./environment.item";

@Component({
	selector: `gurl-environments`,
	template: `
    <div class="px-2 pt-2">
      <label class="input input-ghost w-full input-primary bg-base-300">
        <lucide-angular [img]="SearchIcon" class="size-4" />
        <input
          type="search"
          required
          placeholder="Search"
          [value]="searchInput()"
          (input)="handleInput($event)"
        />
      </label>
    </div>
    @if (appSvc.environments().length) {
    <div class="flex-1 flex flex-col overflow-y-auto gap-1 p-2">
      @for (item of appSvc.environments(); track item.id) {
       <div
       gurl-environment-item
       [data]="item"
       >
       </div>
      }
    </div>
    }@else {
    <div class="flex-1 flex flex-col justify-center items-center">
          <div class="flex flex-col gap-2 opacity-30">
            <button class="btn btn-lg btn-ghost" (click)="handleOpenAddEnvModal()">
                  <lucide-angular [img]="AddIcon" class="size-8" />
                  <span class="text-lg">Environment</span>
            </button>
           </div>
      </div>
    }
  `,
	imports: [LucideAngularModule, GurlEnvironmentItem],
})
export class GurlEnvironments {
	@HostBinding("class")
	def = "flex flex-1 flex-col overflow-hidden";

	protected readonly InfoIcon = Info;
	protected readonly SearchIcon = Search;
	protected readonly AddIcon = CirclePlus;
	protected appSvc = inject(AppService);
	private readonly modalsSvc = inject(GlobalModalsService);

	protected searchInput = signal<string>("");

	protected handleOpenAddEnvModal() {
		this.modalsSvc.handleOpenCreateEnvModal();
	}

	protected handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		this.searchInput.set(target.value);
		this.appSvc.envSearchKeyChange$.next(target.value);
	}
}
