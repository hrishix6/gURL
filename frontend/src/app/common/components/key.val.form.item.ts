import { NgClass } from "@angular/common";
import { Component, HostBinding, input, output } from "@angular/core";
import { LucideAngularModule, X } from "lucide-angular";
import type { KeyValItem } from "@/types";
import { HighlightedInput } from "./highlighted.input";

@Component({
	selector: "app-keyval-item",
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
        highlightedInp
        [placeHolder]="'key'"
        [disabled]="false"
        [text]="item.key"
        (onInput)="handleUpdateKey(item.id, $event)"
        (onBlur)="handleBlur()"
      >
      </div>
      <div class="flex-2">
          <div
          [placeHolder]="'value'"
          highlightedInp
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
	imports: [LucideAngularModule, NgClass, HighlightedInput],
})
export class KeyValFormItem {
	@HostBinding("class")
	hostClass = "flex flex-col gap-2.5";

	readonly CanceIcon = X;
	items = input.required<KeyValItem[]>();
	placeholderId = input.required<string>();
	onKeyUpdate = output<{ id: string; v: string }>();
	onEnabledUpdate = output<{ id: string; v: string }>();
	onValUpdate = output<{ id: string; v: string }>();
	onBlur = output();
	onDelete = output<string>();

	handleUpdateKey(id: string, v: string) {
		this.onKeyUpdate.emit({ id, v });
	}

	handleUpdateVal(id: string, v: string) {
		this.onValUpdate.emit({ id, v });
	}

	handleDeleteItem(id: string) {
		this.onDelete.emit(id);
	}

	handleBlur() {
		this.onBlur.emit();
	}

	handleEnable(id: string, e: Event) {
		const target = e.target as HTMLInputElement;
		console.log(target.checked);
		this.onEnabledUpdate.emit({ id, v: target.checked ? "on" : "off" });
	}
}
