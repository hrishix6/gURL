import { NgClass } from "@angular/common";
import { Component, HostBinding, inject } from "@angular/core";
import {
	CircleAlert,
	HardDriveDownload,
	LucideAngularModule,
} from "lucide-angular";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { BytesPipe } from "@/common/pipes/bytes.pipe";
import { SafePipe } from "@/common/pipes/safe.html.pipe";
import { FormService } from "@/services";
import { ResponseTextPreview } from "./text.preview";

@Component({
	selector: "div[resPreview]",
	template: `
    @if(formSvc.res()?.limitExceeded){
        <div class="flex-1 flex items-center rounded-box justify-center shadow-md border-2 border-base-100">
                <div class="flex flex-col gap-2 items-center">
                    <lucide-angular [img]="ErroredReqIcon" class="size-16" />
                    <span class="text-lg">
                        @if(formSvc.res()?.sizeNotReported){
                            Server did not report Content-Length, download stopped after reaching limit 1kb. 
                       } @else {
                        Server reported Content-length as {{formSvc.res()?.reportedSize | bytes}}, dowload stopped after reaching limit 100 Mb.
                       }
                    </span>
                </div>
        </div>
    }
    @else {
        @if(formSvc.res()?.body?.canRender){
            <div class="flex-1 flex relative overflow-auto shadow-md border-2 border-base-100 rounded-box">
                 <div [ngClass]="{
                    'flex-1 flex': true,
                    'hidden': !formSvc.previewMode(),
                 }">
                    @switch (formSvc.res()?.body?.html5Element) {
                        <!-- PDF -->
                        @case ("pdf") {
                            <pdf-viewer 
                            [src]="formSvc.res()?.body?.src" 
                            [original-size]="false"
                            [c-maps-url]="'/cmaps/'"
                            [fit-to-page]="true"
                            class="block h-full w-full"
                            >     
                            </pdf-viewer>
                        }

                        <!-- IMAGE -->
                         @case ("img") {
                            <div [ngClass]="{
                            'h-full w-full flex items-center justify-center': true,
                            }
                            ">
                            <img [src]="formSvc.res()?.body?.src | safe" />
                            </div>
                        }

                        <!-- AUDIO -->
                        @case ("audio") {
                            <div [ngClass]="{
                                'h-full w-full flex items-center justify-center': true,
                            }">
                                <audio [src]="formSvc.res()?.body?.src | safe" controls></audio>
                            </div>
                        }

                        <!-- VIDEO -->
                        @case("video") {
                            <div [ngClass]="{
                            'h-full w-full flex items-center justify-center': true,
                            }">
                            <video [src]="formSvc.res()?.body?.src | safe" controls></video>
                            </div>
                        }

                        <!-- TEXT -->
                        @case("text") {
                            <div [ngClass]="{
                                'flex-1 flex text-lg': true,
                            }" appResTextPreview [src]="formSvc.res()?.body?.src"></div>
                        }
                    }
                 </div>

                <div [ngClass]="{
                    'flex-1 flex items-center justify-center': true,
                    'hidden': formSvc.previewMode(),
                }">
                @if(formSvc.res()?.size){
                    <button class="btn xl:btn-lg btn-soft btn-primary" (click)="formSvc.saveToFile()">
                        <lucide-angular [img]="DownloadIcon"  class="size-5 xl:size-6"/>
                        Download {{formSvc.res()?.body?.extension}}
                    </button>
                }@else {
                    <span>No Body</span>
                }
                </div>
            </div>
        }
        @else {
            <div class="flex-1 flex items-center rounded-box justify-center shadow-md border-2 border-base-100">
                @if(formSvc.res()?.size){
                    <button class="btn xl:btn-lg btn-soft btn-primary" (click)="formSvc.saveToFile()">
                        <lucide-angular [img]="DownloadIcon"  class="size-5 xl:size-6"/>
                        Download {{formSvc.res()?.body?.extension}}
                    </button>
                }@else {
                    <span>No Body</span>
                }
            </div>
        }
    }
    `,
	imports: [
		LucideAngularModule,
		NgClass,
		SafePipe,
		ResponseTextPreview,
		BytesPipe,
		PdfViewerModule,
	],
})
export class ResPreview {
	readonly DownloadIcon = HardDriveDownload;
	readonly ErroredReqIcon = CircleAlert;
	formSvc = inject(FormService);
	@HostBinding("class")
	def = "flex-1 flex overflow-hidden";
}
