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
import { humanTime } from "../../../common/utils/time";
import { TabsService } from "../../../services";
import type { ReqHistoryItem } from "../../../../types";
import { ReqMethodTag } from "../../../request/method.tag";

@Component({
	selector: `div[gurlReqHistoryItem]`,
	template: `
    <div class="flex items-center gap-2">
      <div methodTag [size]="'xs'" [method]="data().method"></div>
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
export class RequestHistoryItem implements OnInit, OnDestroy {
	data = input.required<ReqHistoryItem>();
	tabSvc = inject(TabsService);
	timerRef: number | null = null;
	timeSince = signal<string>("");

	@HostBinding("class")
	def =
		"flex shrink-0 bg-base-200 grow-0 flex-col gap-4 rounded-box p-2 overflow-hidden hover:bg-base-100 hover:border-primary transition-all cursor-pointer";

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

	@HostListener("click")
	handleClick() {
		this.tabSvc.createTabFromHistory(this.data());
	}
}
