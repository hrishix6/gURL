import {
	Component,
	HostBinding,
	HostListener,
	inject,
	input,
	type OnDestroy,
	type OnInit,
	signal,
} from "@angular/core";
import { humanTime } from "@/common/utils/time";
import { ReqMethodTag } from "@/request/method.tag";
import { TabsService } from "@/services";
import type { ReqHistoryItem } from "@/types";

@Component({
	selector: `a[gurl-history-item]`,
	template: `
    <div class="flex items-center gap-2">
      <div gurl-req-tag  [size]="'xs'" [method]="data().method"></div>
      @if (data().success) {
      <div class="badge badge-soft badge-success badge-sm">{{ data().statusText }}</div>
      }@else {
      <div class="badge badge-soft badge-error badge-sm">{{ data().statusText }}</div>
      }

      <span class="text-xs text-gray-400 ml-auto">{{ timeSince() }}</span>
    </div>
    <p class="text-sm truncate">{{ data().url }}</p>
  `,
	imports: [ReqMethodTag],
})
export class GurlHistoryItem implements OnInit, OnDestroy {
	@HostBinding("class")
	def =
		"flex shrink-0 border-2 border-base-100 shadow-md grow-0 flex-col gap-4 rounded-box p-2 overflow-hidden hover:bg-base-100 focus:outline-none focus:ring-2 focus:ring-primary hover:cursor-pointer transition-all delay-50 ease-in-out";

	@HostListener("click")
	handleClick() {
		this.tabSvc.createTabFromHistory(this.data());
	}

	data = input.required<ReqHistoryItem>();

	ngOnInit(): void {
		this.timeSince.set(humanTime(this.data().executed));
		this.timerRef = setInterval(() => {
			this.timeSince.set(humanTime(this.data().executed));
		}, 5000);
	}

	ngOnDestroy(): void {
		if (this.timerRef) {
			clearInterval(this.timerRef);
		}
	}

	private readonly tabSvc = inject(TabsService);
	protected timerRef: number | null = null;
	protected timeSince = signal<string>("");
}
