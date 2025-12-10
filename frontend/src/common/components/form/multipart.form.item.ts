import { NgClass } from '@angular/common';
import { Component, HostBinding, input, output } from '@angular/core';
import { Eraser, LucideAngularModule, Paperclip, X } from 'lucide-angular';
import { ChooseFile } from '../../../../wailsjs/go/main/Gurl';
import { main } from '../../../../wailsjs/go/models';
import { MultipartItem } from '../../../app/models';
import { BytesPipe } from '../../pipes/bytes.pipe';

@Component({
  selector: 'app-multipart-item',
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
      <div class="flex-1">
        <input
          type="text"
          placeholder="key"
          class="input input-sm w-full input-primary xl:input-md"
          [value]="item.key"
          (input)="handleUpdateKey(item.id, $event.target.value)"
          (blur)="handleBlur()"
        />
      </div>
      <div class="flex-1 relative">
        @if(typeof item.val === 'string'){
        <input
          type="text"
          placeholder="value"
          class="input input-sm w-full input-primary xl:input-md"
          [disabled]="item.key == '' || item.key.trim() == ''"
          [value]="item.val"
          (input)="handleUpdateVal(item.id, $event.target.value)"
          (blur)="handleBlur()"
        />
        }@else {
        <input
          type="text"
          class="input input-sm w-full input-primary xl:input-md"
          [disabled]="item.key == '' || item.key.trim() == ''"
          [readOnly]="true"
          [value]="fileDisplayName(item.val)"
          (input)="handleUpdateVal(item.id, $event.target.value)"
          (blur)="handleBlur()"
        />
        }
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
      </div>
      <button
        [ngClass]="{
          'btn btn-xs btn-ghost xm:btn-sm': true,
        }"
        [disabled]="item.id === placeholderId()"
        (click)="handleDeleteItem(item.id)"
      >
        <lucide-angular [img]="CanceIcon" class="size-4"></lucide-angular>
      </button>
    </div>
    }
  `,
  imports: [LucideAngularModule, NgClass],
})
export class MultiPartFormItem {
  @HostBinding('class')
  hostClass = 'flex flex-col gap-2.5';

  readonly CanceIcon = X;
  readonly BinaryIcon = Paperclip;
  readonly ClearFileIcon = Eraser;
  items = input.required<MultipartItem[]>();
  placeholderId = input.required<string>();
  onKeyUpdate = output<{ id: string; v: string }>();
  onEnabledUpdate = output<{ id: string; v: string }>();
  onValUpdate = output<{ id: string; v: string | main.FileStats }>();
  onClearFileInput = output<{ id: string }>();
  onBlur = output();
  onDelete = output<string>();

  async openFileDialogue(id: string) {
    try {
      const file = await ChooseFile();

      this.onValUpdate.emit({ id, v: file });
    } catch (error) {
      console.error(error);
    }
  }

  handleUpdateKey(id: string, v: string) {
    this.onKeyUpdate.emit({ id, v });
  }

  fileDisplayName(fileStats: main.FileStats) {
    return `${fileStats.name} (${new BytesPipe().transform(fileStats.size)})`;
  }

  handleUpdateVal(id: string, v: string | main.FileStats) {
    this.onValUpdate.emit({ id, v });
  }

  handleClearFileField(id: string) {
    this.onClearFileInput.emit({ id });
  }

  handleDeleteItem(id: string) {
    this.onDelete.emit(id);
  }

  handleBlur() {
    this.onBlur.emit();
  }

  handleEnable(id: string, e: Event) {
    const target = e.target as HTMLInputElement;
    this.onEnabledUpdate.emit({ id, v: target.value });
  }
}
