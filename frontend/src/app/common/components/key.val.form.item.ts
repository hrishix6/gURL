import { NgClass } from "@angular/common";
import { Component, HostBinding, input, output } from "@angular/core";
import { LucideAngularModule, X } from "lucide-angular";
import type { KeyValItem } from "@/types";
import { GurlHighlightedInput } from "./highlighted.input";

@Component({
	selector: "gurl-keyval-item",
	template: `
    @for (item of items(); track item.id) {
    <div class="flex gap-2.5 items-center">
      <input
        type="checkbox"
        class="checkbox checkbox-xs checkbox-primary xl:checkbox-sm"
        [disabled]="item.key == '' || item.key.trim() == ''"
        [checked]="item.enabled === 'on'"
        (change)="handleEnable(item.id, $event)"
      />
      <div
        gurl-highlighted-input
        [placeHolder]="'key'"
        [disabled]="false"
        [text]="item.key"
        (onInput)="handleUpdateKey(item.id, $event)"
        (onBlur)="handleBlur()"
      >
      </div>
      <div class="flex-2">
          <div
          gurl-highlighted-input
          [placeHolder]="'value'"
          [disabled]="item.key == '' || item.key.trim() == ''"
          [text]="item.val"
          (onInput)="handleUpdateVal(item.id, $event)"
          (onBlur)="handleBlur()"
        >
        </div>
      </div>
      <button
        [ngClass]="{
          'btn btn-xs btn-ghost btn-square xl:btn-sm': true,
        }"
        [disabled]="item.id === placeholderId()"
        (click)="handleDeleteItem(item.id)"
      >
        <lucide-angular [img]="CanceIcon" class="size-4"></lucide-angular>
      </button>
    </div>
    }
  `,
	imports: [LucideAngularModule, NgClass, GurlHighlightedInput],
})
export class KeyValFormItem {
	@HostBinding("class")
	hostClass = "flex flex-col gap-2.5";

	items = input.required<KeyValItem[]>();
	placeholderId = input.required<string>();
	onKeyUpdate = output<{ id: string; v: string }>();
	onEnabledUpdate = output<{ id: string; v: string }>();
	onValUpdate = output<{ id: string; v: string }>();
	onBlur = output();
	onDelete = output<string>();

	protected readonly CanceIcon = X;

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
		this.onBlur.emit();
	}

	protected handleEnable(id: string, e: Event) {
		const target = e.target as HTMLInputElement;
		this.onEnabledUpdate.emit({ id, v: target.checked ? "on" : "off" });
	}
}
