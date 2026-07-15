import { NgClass } from "@angular/common";
import { Component, HostBinding, inject } from "@angular/core";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { SystemIconComponent } from "@/common/components/icon";
import { BytesPipe } from "@/common/pipes/bytes.pipe";
import { SafePipe } from "@/common/pipes/safe.html.pipe";
import { DL_LIMIT_BYTES } from "@/constants";
import { FormService } from "@/services";
import { ResponseTextPreview } from "./text.preview";

@Component({
	selector: "gurl-res-preview",
	template: `
    @if(formSvc.res()?.limitExceeded){
        <div class="flex-1 flex items-center rounded-box justify-center shadow-md border-2 border-base-100">
                <div class="flex flex-col gap-2 items-center">
                    <i gurl-icon [icon]="'Failed'" [className]="'size-16'" ></i>
                    <span class="text-lg">
                        @if(formSvc.res()?.sizeNotReported){
                            Server did not report Content-Length, download stopped after reaching limit {{ MAX_DL_LIMIT | bytes}}
                       } @else {
                        Server reported Content-length as {{formSvc.res()?.reportedSize | bytes}}, dowload stopped after reaching limit {{ MAX_DL_LIMIT | bytes}}
                       }
                    </span>
                </div>
        </div>
    }
    @else {
        @if(formSvc.res()?.body?.canRender){
            <div class="flex-1 flex relative overflow-auto shadow-md rounded-box">
                 <div [ngClass]="{
                    'flex-1 flex': true,
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
                                'flex-1 flex': true,
                            }" 
                            gurl-res-text-preview
                            [mode]="'plaintext'"
                            ></div>
                        }

                        @case("xml") {
                            <div [ngClass]="{
                                'flex-1 flex': true,
                            }" 
                            gurl-res-text-preview 
                            [mode]="'xml'"
                            ></div>
                        }
                        @case("json") {
                            <div [ngClass]="{
                                'flex-1 flex': true,
                            }" 
                            gurl-res-text-preview 
                            [mode]="'json'"
                            ></div>
                        }
                    }
                 </div>
            </div>
        }
        @else {
            <div class="flex-1 flex items-center rounded-box justify-center shadow-md border-2 border-base-100">
                @if(formSvc.res()?.size){
                    <button class="btn xl:btn-lg btn-soft btn-primary" (click)="formSvc.saveToFile()">
                        <i gurl-icon [icon]="'Export'" [className]="'size-5 xl:size-6'" ></i>
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
		NgClass,
		SafePipe,
		ResponseTextPreview,
		BytesPipe,
		PdfViewerModule,
		SystemIconComponent,
	],
})
export class ResPreview {
	@HostBinding("class")
	def = "flex-1 flex overflow-hidden";
	protected readonly formSvc = inject(FormService);
	protected readonly MAX_DL_LIMIT = DL_LIMIT_BYTES;
}
