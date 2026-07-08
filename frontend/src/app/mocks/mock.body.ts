import { Component, inject } from "@angular/core";
import type { models } from "@wailsjs/go/models";
import { GurlDropdown } from "@/common/components";
import { CodeEditor } from "@/common/components/code-editor";
import { SystemIconComponent } from "@/common/components/icon";
import { MOCK_BODY_TYPES } from "@/constants";
import { FileInput } from "@/request/file.input";
import { MockTabFormService } from "@/services";
import { AppTabType } from "@/types";

@Component({
	selector: `gurl-mock-body`,
	template: `
      <div class="flex-1 overflow-y-auto relative p-2">
        @switch (f.bodyType().id) { @case("none") {
              <div class="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-10">
                  <i gurl-icon [icon]="'Empty'" [className]="'size-16 -z-10'" ></i>
              </div>
          } 
        @case("json"){
          <gurl-code-editor 
          [mode]="f.bodyType().id"
          [envChange$]="f.activeEnvChange$"
          [resolveVar]="f.resolveEnvVariable"
          [readonly]="false"
          [text]="f.textBody()"
          (onChange)="f.setTextBody($event)"
          />
        } @case("xml") {
          <gurl-code-editor 
            [mode]="f.bodyType().id"
            [envChange$]="f.activeEnvChange$"
            [resolveVar]="f.resolveEnvVariable"
            [readonly]="false"
            [text]="f.textBody()"
            (onChange)="f.setTextBody($event)"
          />
        } @case ("plaintext") {
          <gurl-code-editor 
            [mode]="f.bodyType().id"
            [envChange$]="f.activeEnvChange$"
            [resolveVar]="f.resolveEnvVariable"
            [readonly]="false"
            [text]="f.textBody()"
            (onChange)="f.setTextBody($event)"
          />
        } @case ("binary") {
        <div class="absolute top-0 left-0 w-full h-full flex justify-center items-center">
          <gurl-file-input 
            [tabType]="tabType"
            [binaryBody]="f.binaryBody()"
            (onClearFile)="f.clearBinaryBody()"
            (onFileStats)="handleBinaryFileSelection($event)"
          />
        </div>
        } }
      </div>
     <div class="px-2">
            <gurl-dropdown
                  [items]="mockBodyTypes"
                  [activeItem]="f.bodyType()"
                  [direction]="'top'"
                  [align]="'start'" 
                  [size]="'sm'"
                  [varient]="'soft'"
                  [disabled]="false"
                  [primary]="false"
                  (onItemSelection)="f.setBodyType($event)"
            />
     </div>
    `,
	imports: [SystemIconComponent, FileInput, GurlDropdown, CodeEditor],
})
export class MockBody {
	protected readonly f = inject(MockTabFormService);
	protected readonly tabType = AppTabType.Mock;

	protected readonly mockBodyTypes = MOCK_BODY_TYPES;

	protected handleTextBodyUpdate(e: Event) {
		const target = e.target as HTMLInputElement;
		this.f.setTextBody(target.value);
	}

	handleBinaryFileSelection(f: models.FileStats) {
		this.f.setBinaryBody(f);
	}
}
