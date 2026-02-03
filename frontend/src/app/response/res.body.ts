import { Component, HostBinding, inject } from "@angular/core";
import {
	Ban,
	CircleAlert,
	LucideAngularModule,
	MessageCircleOff,
} from "lucide-angular";
import { FormService } from "@/services";
import { ResPreview } from "./res.preview";

@Component({
	selector: "gurl-res-body",
	template: `
        @switch (formSvc.reqState()) {
            <!-- IDLE / NOT SENT -->
            @case ("idle") {
                <div class="flex-1 flex items-center justify-center opacity-10">
                        <lucide-angular [img]="NoneIcon" class="size-16 -z-10" />
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
                        <lucide-angular [img]="FailedIcon" class="size-16 -z-10" />
                </div>
            }

            <!-- ABORTED -->
            @case("aborted"){
                <div class="flex-1 flex items-center justify-center opacity-10">
                        <lucide-angular [img]="AbortedIcon" class="size-16 -z-10" />
                </div>
            }

        }
    `,
	imports: [LucideAngularModule, ResPreview],
})
export class ResBody {
	@HostBinding("class")
	def = "flex-1 flex overflow-hidden";

	protected readonly NoneIcon = Ban;
	protected readonly AbortedIcon = MessageCircleOff;
	protected readonly FailedIcon = CircleAlert;
	protected readonly formSvc = inject(FormService);
}
