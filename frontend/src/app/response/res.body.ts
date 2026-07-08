import { Component, inject } from "@angular/core";
import { SystemIconComponent } from "@/common/components/icon";
import { FormService } from "@/services";
import { ResPreview } from "./res.preview";

@Component({
	selector: "gurl-res-body",
	template: `
        @switch (formSvc.reqState()) {
            <!-- IDLE / NOT SENT -->
            @case ("idle") {
                <div class="flex-1 flex items-center justify-center opacity-10">
                        <i gurl-icon [icon]="'Empty'" [className]="'size-16 -z-10'" ></i>
                </div>
            }
            <!-- IN PROGRESS -->
            @case("progress"){
                <div class="flex-1 flex flex-col gap-2 items-center justify-center shadow-md border-2 border-base-100">
                        <span class="loading loading-ring text-primary loading-sm xl:loading-lg"></span>
                        <button class="btn btn-soft btn-primary btn-lg" (click)="formSvc.cancel()">Abort</button>
                </div>
            }
            <!-- SUCESSFUL -->
            @case("success"){
                <gurl-res-preview />
            }
            <!-- FAILED -->
            @case("error") {
                <div class="flex-1 flex items-center justify-center opacity-10">
                           <i gurl-icon [icon]="'Failed'" [className]="'size-16 -z-10'" ></i>
                </div>
            }

            <!-- ABORTED -->
            @case("aborted"){
                <div class="flex-1 flex items-center justify-center opacity-10">
                           <i gurl-icon [icon]="'Aborted'" [className]="'size-16 -z-10'" ></i>
                </div>
            }
        }
    `,
	imports: [ResPreview, SystemIconComponent],
})
export class ResBody {
	protected readonly formSvc = inject(FormService);
}
