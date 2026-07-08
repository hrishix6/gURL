import { NgClass } from "@angular/common";
import { Component, HostBinding, input, output } from "@angular/core";
import type { models } from "@wailsjs/go/models";
import type { Subject } from "rxjs";
import type { AppTabType, InputToken } from "@/types";
import { GurlHighlightedInput } from "./highlighted.input";
import { SystemIconComponent } from "./icon";

@Component({
	selector: "gurl-keyval-item",
	template: `
    @for (item of items(); track item.id) {
    <div class="flex gap-2.5 items-center">
      @if(tabType() === "req" || tabType() === "mock"){
          <input
          type="checkbox"
          class="checkbox checkbox-xs checkbox-primary xl:checkbox-sm"
          [disabled]="item.key == '' || item.key.trim() == ''"
          [checked]="item.enabled === 'on'"
          (change)="handleEnable(item.id, $event)"
        />
      } 
      <div
        gurl-highlighted-input
        [activeEnvSub]="activeEnvSub()"
        [placeHolder]="'key'"
        [readonly]="tabType() === 'req_example'"
        [disabled]="false"
        [text]="item.key"
        (onInput)="handleUpdateKey(item.id, $event)"
        (onBlur)="handleBlur()"
        [extractTokensFn]="extractTokensFn()"
      >
      </div>
      <div class="flex-2">
        <div
          gurl-highlighted-input
          [activeEnvSub]="activeEnvSub()"
          [placeHolder]="'value'"
          [disabled]="item.key == '' || item.key.trim() == ''"
          [text]="item.val"
          (onInput)="handleUpdateVal(item.id, $event)"
          (onBlur)="handleBlur()"
          [readonly]="tabType() === 'req_example'"
          [extractTokensFn]="extractTokensFn()"
        >
        </div>
      </div>
       @if(tabType() === "req" || tabType() === "mock"){
        <button
          [ngClass]="{
            'btn btn-xs btn-ghost btn-square xl:btn-sm': true,
          }"
          [disabled]="item.id === placeholderId()"
          (click)="handleDeleteItem(item.id)"
        >
          <i gurl-icon [icon]="'Cancel'" [className]="'size-4'" ></i>
      </button>
      } 
    </div>
    }
  `,
	imports: [NgClass, GurlHighlightedInput, SystemIconComponent],
})
export class KeyValFormItem {
	@HostBinding("class")
	hostClass = "flex flex-col gap-2.5";

	extractTokensFn = input.required<(v: string) => InputToken[]>();
	activeEnvSub = input.required<Subject<void>>();

	items = input.required<models.GurlKeyValItem[]>();
	placeholderId = input.required<string>();
	tabType = input.required<AppTabType>();
	onKeyUpdate = output<{ id: string; v: string }>();
	onEnabledUpdate = output<{ id: string; v: string }>();
	onValUpdate = output<{ id: string; v: string }>();
	onBlur = output();
	onDelete = output<string>();

	protected handleUpdateKey(id: string, v: string) {
		this.onKeyUpdate.emit({ id, v });
	}

	protected handleUpdateVal(id: string, v: string) {
		this.onValUpdate.emit({ id, v });
	}

	protected handleDeleteItem(id: string) {
		this.onDelete.emit(id);
	}

	protected handleBlur() {
		if (this.tabType() === "req_example") {
			return;
		}
		this.onBlur.emit();
	}

	protected handleEnable(id: string, e: Event) {
		const target = e.target as HTMLInputElement;
		this.onEnabledUpdate.emit({ id, v: target.checked ? "on" : "off" });
	}
}
