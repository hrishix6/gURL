import { NgClass } from "@angular/common";
import { Component, HostBinding, input, output } from "@angular/core";
import { Key, LucideAngularModule, X } from "lucide-angular";
import { ENV_ID_PLACEHOLDER } from "@/constants";
import type { EnvironmentItem } from "@/types";

@Component({
	selector: `div[gurl-env-form-item]`,
	template: `
      <button
        [ngClass]="{
          'btn btn-xs btn-square xl:btn-md': true,
          'btn-primary': item().isSecret
        }"
        (click)="handleSecretStatusToggle(item().id)"
        [disabled]="item().key == '' || item().key.trim() == ''"
        >
        <lucide-angular [img]="MaskIcon" class="size-4"></lucide-angular>
      </button>
      <input
        type="text"
        placeholder="key"
        class="input input-sm flex-2 input-ghost bg-base-300 input-primary xl:input-md"
        [value]="item().key"
        (input)="handleUpdateKey(item().id, $event.target.value)"
        (blur)="handleBlur()"
      />     
      <input
        [type]="item().isSecret? 'password': 'text'"
        placeholder="value"
        class="input input-sm flex-2 input-ghost bg-base-300 input-primary xl:input-md"
        [disabled]="item().key == '' || item().key.trim() == ''"
        [value]="item().val"
        (input)="handleUpdateVal(item().id, $event.target.value)"
        (blur)="handleBlur()"
    />
      <input
        type="text"
        placeholder="description"
        class="input input-sm flex-4 input-ghost bg-base-300 input-primary xl:input-md"
        [disabled]="item().key == '' || item().key.trim() == ''"
        [value]="item().description"
        (input)="handleUpdateDescription(item().id, $event.target.value)"
        (blur)="handleBlur()"
      />
      <button
        [ngClass]="{
          'btn btn-xs btn-ghost btn-square xl:btn-sm': true,
        }"
        [disabled]="item().id === placeholderId"
        (click)="handleDeleteItem(item().id)"
      >
        <lucide-angular [img]="CancelIcon" class="size-4"></lucide-angular>
      </button>
    `,
	imports: [LucideAngularModule, NgClass],
})
export class EnvironmentFormItem {
	@HostBinding("class")
	hostClass = "flex gap-2.5 items-center";

	item = input.required<EnvironmentItem>();
	onKeyUpdate = output<{ id: string; v: string }>();
	onValUpdate = output<{ id: string; v: string }>();
	onDescriptionUpdate = output<{ id: string; v: string }>();
	onSecretStatusChange = output<{ id: string }>();
	onBlur = output();
	onDelete = output<string>();

	protected placeholderId = ENV_ID_PLACEHOLDER;
	protected readonly CancelIcon = X;
	protected readonly MaskIcon = Key;

	protected handleUpdateKey(id: string, v: string) {
		this.onKeyUpdate.emit({ id, v });
	}

	protected handleUpdateVal(id: string, v: string) {
		this.onValUpdate.emit({ id, v });
	}

	protected handleUpdateDescription(id: string, v: string) {
		this.onDescriptionUpdate.emit({ id, v });
	}

	protected handleSecretStatusToggle(id: string) {
		this.onSecretStatusChange.emit({ id });
	}

	protected handleDeleteItem(id: string) {
		this.onDelete.emit(id);
	}

	protected handleBlur() {
		this.onBlur.emit();
	}
}
