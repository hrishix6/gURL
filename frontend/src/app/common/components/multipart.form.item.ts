import { NgClass } from "@angular/common";
import { Component, HostBinding, input, output } from "@angular/core";
import type { models } from "@wailsjs/go/models";
import { Eraser, LucideAngularModule, Paperclip, X } from "lucide-angular";
import { getFileRepository } from "@/services";
import type { AppTabType, MultipartItem } from "@/types";
import { humanBytes } from "../utils/time";
import { GurlHighlightedInput } from "./highlighted.input";

@Component({
	selector: "gurl-multipart-item",
	template: `
    @for (item of items(); track item.id) {
    <div class="flex gap-2.5 items-center">
      @if(tabType() === "req"){
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
        [placeHolder]="'key'"
        [disabled]="false"
        [readonly]="tabType() === 'req_example'"
        [text]="item.key"
        (onInput)="handleUpdateKey(item.id, $event)"
        (onBlur)="handleBlur()"
      >
      </div>
      <div class="flex-2 relative">
        @if(typeof item.val === 'string'){
        <div
          gurl-highlighted-input
          [placeHolder]="'value'"
          [disabled]="item.key == '' || item.key.trim() == ''"
          [readonly]="tabType() === 'req_example'"
          [text]="item.val"
          (onInput)="handleUpdateVal(item.id, $event)"
          (onBlur)="handleBlur()"
         ></div>
        }@else {
        <input
          type="text"
          class="input input-sm w-full input-ghost bg-base-300 input-primary xl:input-md"
          [disabled]="item.key == '' || item.key.trim() == ''"
          [readonly]="tabType() === 'req_example'"
          [readOnly]="true"
          [value]="fileDisplayName(item.val)"
          (input)="handleUpdateVal(item.id, $event.target.value)"
          (blur)="handleBlur()"
        />
        }
        @if(tabType() === 'req') {
        <div class="absolute flex items-center justify-center z-10 top-0 right-1 h-full">
          <button
            [ngClass]="{
            'btn btn-xs btn-ghost xl:btn-sm': true,
            'hidden': typeof item.val === 'string' && !!item.val,
            }"
            [disabled]="item.id === placeholderId() || item.key == '' || item.key.trim() == ''"
            (click)="openFileDialogue(item.id)"
          >
            <lucide-angular [img]="BinaryIcon" class="size-4" />
          </button>
          <button
            [ngClass]="{  
            'btn btn-xs btn-ghost xl:btn-sm': true,
            'hidden': typeof item.val === 'string' || !item.val
            }"
            [disabled]="item.id === placeholderId() || item.key == '' || item.key.trim() == ''"
            (click)="handleClearFileField(item.id)"
          >
            <lucide-angular [img]="ClearFileIcon" class="size-4" />
          </button>
        </div>
        }
      </div>
      @if(tabType() === "req"){
      <button
        [ngClass]="{
          'btn btn-xs btn-ghost btn-square xl:btn-sm': true,
        }"
        [disabled]="item.id === placeholderId()"
        (click)="handleDeleteItem(item.id)"
      >
        <lucide-angular [img]="CanceIcon" class="size-4"></lucide-angular>
      </button>
    }
    </div>
    }
  `,
	imports: [LucideAngularModule, NgClass, GurlHighlightedInput],
})
export class MultiPartFormItem {
	@HostBinding("class")
	hostClass = "flex flex-col gap-2.5";

	tabType = input.required<AppTabType>();
	items = input.required<MultipartItem[]>();
	placeholderId = input.required<string>();
	onKeyUpdate = output<{ id: string; v: string }>();
	onEnabledUpdate = output<{ id: string; v: string }>();
	onValUpdate = output<{ id: string; v: string | models.FileStats }>();
	onClearFileInput = output<{ id: string }>();
	onBlur = output();
	onDelete = output<string>();

	private readonly fileRepo = getFileRepository();
	protected readonly CanceIcon = X;
	protected readonly BinaryIcon = Paperclip;
	protected readonly ClearFileIcon = Eraser;

	protected async openFileDialogue(id: string) {
		try {
			const file = await this.fileRepo.chooseFile();

			this.onValUpdate.emit({ id, v: file });
		} catch (error) {
			console.error(error);
		}
	}

	protected handleUpdateKey(id: string, v: string) {
		this.onKeyUpdate.emit({ id, v });
	}

	protected fileDisplayName(fileStats: models.FileStats) {
		return `${fileStats.name} (${humanBytes(fileStats.size)})`;
	}

	protected handleUpdateVal(id: string, v: string | models.FileStats) {
		this.onValUpdate.emit({ id, v });
	}

	protected handleClearFileField(id: string) {
		this.onClearFileInput.emit({ id });
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
