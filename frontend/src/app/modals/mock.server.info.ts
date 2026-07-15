import { Component, HostBinding, input, output, signal } from "@angular/core";
import { SystemIconComponent } from "@/common/components/icon";
import { copyTextToClipboard } from "@/common/utils/text";
import type { MockCallingInfo } from "@/types";

interface ServerInfoCopyStatus {
	url: boolean;
	authKey: boolean;
	authVal: boolean;
	matchKey: boolean;
	matchVal: boolean;
}

@Component({
	selector: `dialog[gurl-mock-server-info-modal]`,
	template: `
        <div class="modal-box w-[75%] max-w-5xl">
                <div class="flex flex-1 flex-col gap-4">
                    <div class="flex justify-between">  
						<h3 class="text-lg font-bold">
                           @if(data()?.match){
							 Mock Response
							}@else {
                             Mock Server
							}
                        </h3>
						<button class="btn btn-sm btn-square btn-ghost" (click)="handleClose()">
							<i gurl-icon [icon]="'Cancel'" [className]="'size-4'" ></i>
						</button>
					</div>
                    <label class="input w-full">
                        <span class="label">URL</span>
                        <input
                            type="text"
                            [value]="data()?.url"
                            [readOnly]="true"
                        />
                        <button class="btn btn-sm btn-ghost btn-square" (click)="handleCopy('url')">
                                 @if(copyStatus()["url"]){
                                    <i gurl-icon [icon]="'Tick'" [className]="'size-4'"></i>
                                 }@else {
                                        <i gurl-icon [icon]="'Copy'" [className]="'size-4'"></i>
                                 }
                        </button>
                    </label>
					<section class="flex flex-col gap-2">
						<h4 class="text-sm flex gap-1">
							<span class="font-semibold">Authentication Header</span> 
							<span class="text-error">*</span>
						</h4>
						<div class="flex items-center gap-2">
								<label class="input flex-1">
									<span class="label">Key</span>
									<input
										type="text"
										[value]="data()?.auth?.key"
										[readOnly]="true"
									/>
									<button class="btn btn-sm btn-square btn-ghost" (click)="handleCopy('authKey')">
										@if(copyStatus()["authKey"]){
											<i gurl-icon [icon]="'Tick'" [className]="'size-4'"></i>
										}@else {
											<i gurl-icon [icon]="'Copy'" [className]="'size-4'"></i>
										}
										
									</button>
								</label>
								<label class="input flex-1">
								<span class="label">Value</span>
									<input
										type="text"
										[value]="data()?.auth?.val"
										[readOnly]="true"
									/>
						
									<button class="btn btn-sm btn-square btn-ghost" (click)="handleCopy('authVal')">
										@if(copyStatus()["authVal"]){
											<i gurl-icon [icon]="'Tick'" [className]="'size-4'"></i>
										}@else {
											<i gurl-icon [icon]="'Copy'" [className]="'size-4'"></i>
										}
										
									</button>
								
								</label>
						</div>
					</section>
					@if(data()?.match){
						<section class="flex flex-col gap-2">
							<h4 class="text-sm flex gap-1">
								<span class="font-semibold ">Match Header</span> 
								<span>(</span>
								<span class="text-base-content/50">
									If not provided server will match first mock that matches path & method
								</span>
								<span>)</span>
							</h4>
							<div class="flex items-center gap-2">
									<label class="input flex-1">
										<span class="label">Key</span>
										<input
											type="text"
											[value]="data()?.match?.key"
											[readOnly]="true"
										/>
										<button class="btn btn-sm btn-square btn-ghost" (click)="handleCopy('matchKey')">
											@if(copyStatus()["matchKey"]){
												<i gurl-icon [icon]="'Tick'" [className]="'size-4'"></i>
											}@else {
												<i gurl-icon [icon]="'Copy'" [className]="'size-4'"></i>
											}
											
										</button>
									</label>
									<label class="input flex-1">
									<span class="label">Value</span>
										<input
											type="text"
											[value]="data()?.match?.val"
											[readOnly]="true"
										/>
							
										<button class="btn btn-sm btn-square btn-ghost" (click)="handleCopy('matchVal')">
											@if(copyStatus()["matchVal"]){
												<i gurl-icon [icon]="'Tick'" [className]="'size-4'"></i>
											}@else {
												<i gurl-icon [icon]="'Copy'" [className]="'size-4'"></i>
											}
											
										</button>
									
									</label>
							</div>
						</section>
					}
					
                </div>
        </div>
        <div class="modal-backdrop">
        <button (click)="handleClose()">Cancel</button>
        </div>
    `,
	imports: [SystemIconComponent],
})
export class MockServerInfoModal {
	@HostBinding("class")
	def = "modal";

	@HostBinding("attr.open") get checkOpen() {
		return this.isOpen() ? "" : null;
	}

	isOpen = input.required<boolean>();

	data = input.required<MockCallingInfo | null>();

	onCancel = output<void>();

	protected handleClose() {
		this.onCancel.emit();
	}

	copyStatus = signal<ServerInfoCopyStatus>({
		url: false,
		authKey: false,
		authVal: false,
		matchKey: false,
		matchVal: false,
	});

	protected async handleCopy(matchKey: keyof ServerInfoCopyStatus) {
		let text = "";

		const copyData = this.data();

		if (copyData) {
			switch (matchKey) {
				case "url": {
					text = copyData.url || "";
					break;
				}
				case "authKey": {
					const auth = copyData.auth!;
					text = auth.key;
					break;
				}
				case "matchKey": {
					const match = copyData.match!;
					text = match.key;
					break;
				}
				case "authVal": {
					const auth = copyData.auth!;
					text = auth.val;
					break;
				}
				case "matchVal": {
					const match = copyData.match!;
					text = match.val;
					break;
				}
			}
		}

		try {
			await copyTextToClipboard(text);
			this.copyStatus.update((prev) => ({
				...prev,
				[matchKey]: true,
			}));
		} catch (error) {
			console.error(error);
		} finally {
			setTimeout(() => {
				this.copyStatus.update((prev) => ({
					...prev,
					[matchKey]: false,
				}));
			}, 1000);
		}
	}
}
