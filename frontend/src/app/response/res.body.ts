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
	selector: "div[resBody]",
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
                <div class="flex-1 flex items-center justify-center shadow-md border-2 border-base-100">
                        <button class="btn btn-primary btn-lg xl:btn-xl" (click)="formSvc.cancel()">
                            <span class="loading loading-ring text-primary loading-sm xl:loading-lg"></span>
                            Abort
                        </button>
                </div>
            }
            <!-- SUCESSFUL -->
            @case("success"){
                <div resPreview></div>
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
	readonly NoneIcon = Ban;
	readonly AbortedIcon = MessageCircleOff;
	readonly FailedIcon = CircleAlert;
	readonly formSvc = inject(FormService);
	@HostBinding("class")
	def = "flex-1 flex overflow-hidden";
}
