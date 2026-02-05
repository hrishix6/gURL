import {
	Component,
	computed,
	HostBinding,
	inject,
	input,
	signal,
} from "@angular/core";
import type { models } from "@wailsjs/go/models";
import {
	ChevronDown,
	ChevronUp,
	Copy,
	EllipsisVertical,
	Eye,
	LucideAngularModule,
	Trash2,
} from "lucide-angular";
import { ReqMethodTag } from "@/request/method.tag";
import { AppService, TabsService } from "@/services";
import { GlobalModalsService } from "@/services/modals.service";

@Component({
	selector: `div[gurl-request-item]`,
	template: `
    <div class="flex flex-col gap-2 p-2">
	  <div class="flex items-center">
			<div class="flex-1 flex items-center flex-nowrap gap-2 overflow-hidden">
				<div gurl-req-tag [size]="'xs'" [method]="data().method"></div>
				<a href="#" class="block focus:underline focus:outline-0 flex-1 text-sm truncate" (click)="handleOpenRequest()">
					{{ data().name }}
				</a>
	 		 </div>
			 @if (requestExamples().length){
			 <button class="btn btn-sm btn-square btn-ghost" (click)="toggleExapand()">
                    @if(isExpanded()) {
                          <lucide-angular [img]="CloseIcon" class="size-4" />
                        }@else {
                          <lucide-angular [img]="OpenIcon" class="size-4" />
                      }
            </button>
			}
			<div class="dropdown dropdown-end" data-el="req-options-btn">
				<button tabindex="0" class="btn btn-sm btn-square btn-ghost">
				<lucide-angular [img]="RequestOptsIcon" class="size-4" />
				</button>
			<ul
			tabindex="-1"
			class="dropdown-content menu bg-base-100 rounded-box z-50 w-max shadow-sm"
			>
				<li class="my-0.5">
					<a href="#" (click)="toggleCopyModal()">
						<lucide-angular [img]="CopyIcon" class="size-4"  /> 
						Copy 
					</a>
				</li>
				<li>
					<a href="#" (click)="toggleDeleteModal()">
						<lucide-angular [img]="DeleteIcon" class="size-4" /> 
						Delete
					</a>
				</li>
			</ul>
	  		</div>
	  </div>
      <p class="text-sm truncate opacity-50">
        {{ data().url }}
      </p>
	  @if(isExpanded()) {
			@if (requestExamples().length) { 
				<p class="text-sm mt-1">
					Examples :
				</p>
				@for (item of requestExamples(); track item.id) {
					<div class="p-2  bg-base-100 rounded box flex items-center justify-between overflow-hidde">
					<span class="text-xs truncate">
						{{ item.name }}
					</span>
					<div class="flex items-center">
						<button class="btn btn-sm btn-square btn-ghost" (click)="handleOpenReqExample(item)">
						<lucide-angular [img]="ViewIcon" class="size-4"  />
						</button>
						<button class="btn btn-sm btn-square btn-ghost" (click)="handleDeleteReqExample(item)">
						<lucide-angular [img]="DeleteIcon" class="size-4"  />
						</button>
					</div>
				</div>
				}
			} 
     }
    </div>
  `,
	imports: [ReqMethodTag, LucideAngularModule],
})
export class GurlRequestItem {
	@HostBinding("class")
	def = "border-2 border-base-100 shadow-md rounded-box";

	data = input.required<models.RequestLightDTO>();

	private readonly tabSvc = inject(TabsService);
	private readonly modalsSvc = inject(GlobalModalsService);
	private readonly appSvc = inject(AppService);

	protected readonly RequestOptsIcon = EllipsisVertical;
	protected readonly DeleteIcon = Trash2;
	protected readonly ViewIcon = Eye;
	protected readonly CopyIcon = Copy;
	protected readonly OpenIcon = ChevronDown;
	protected readonly CloseIcon = ChevronUp;

	isExpanded = signal<boolean>(false);

	toggleExapand() {
		this.isExpanded.update((x) => !x);
	}

	protected handleOpenReqExample(data: models.ReqExampleLightDTO) {
		this.tabSvc.openReqExampleTab(data);
		const parentTarget = document.activeElement as HTMLAnchorElement;
		parentTarget.blur();
	}

	protected handleDeleteReqExample(data: models.ReqExampleLightDTO) {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.modalsSvc.handleOpendeleteReqExampleModal(data);
	}

	protected handleOpenRequest() {
		this.tabSvc.createTabFromSaved(this.data());
		const parentTarget = document.activeElement as HTMLAnchorElement;
		parentTarget.blur();
	}

	protected toggleDeleteModal() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.modalsSvc.handleOpenDeleteReqModal(this.data());
	}

	protected toggleCopyModal() {
		const target = document.activeElement as HTMLAnchorElement;
		target.blur();
		this.modalsSvc.handleOpenCopyReqModal(this.data());
	}

	protected requestExamples = computed<models.ReqExampleLightDTO[]>(() =>
		this.appSvc.savedExamples().filter((x) => x.requestId === this.data().id),
	);
}
