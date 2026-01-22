import { NgClass } from "@angular/common";
import {
	Component,
	DestroyRef,
	type ElementRef,
	effect,
	HostBinding,
	HostListener,
	inject,
	input,
	output,
	signal,
	viewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime, Subject } from "rxjs";
import { AppService } from "@/services";
import type { InputToken } from "@/types";

@Component({
	selector: `div[highlightedInp]`,
	template: `
			<input
				type="text"
				[placeholder]="placeHolder()"
				[ngClass]="{
					'input input-sm flex-1 input-ghost bg-base-300 input-primary xl:input-md': true,
				}"
				[value]="text()"
				(blur)="handleBlur()"
				(input)="handleUpdateVal($event.target.value)"
				#inputEl
				[disabled]="disabled()"
        	/>
			<div
				[ngClass]="{
					'absolute text-sm xl:text-md top-0 left-0 w-full h-full flex rounded-box items-center overflow-hidden z-10 px-3 border border-base-300 bg-base-300': true,
					'opacity-0 pointer-events-none': editMode(),
					'opacity-100': !editMode(),
				}"
        	>   
			<div
				[ngClass]="{
					'overflow-x-auto no-scrollbar whitespace-nowrap flex': true,
			}"
			#overlayEl
			>
				@if(_tokens().length) {
					@for(token of _tokens(); track $index) {
						@if(token.type === 'env') {
							<p
									[ngClass]="{
										'whitespace-pre': true,
										'text-primary': token.valid,
										'text-error': !token.valid
									}"
									[title]="token.valid && token.interpolated? token.interpolated: 'undefined'"
									>{{token.value}}
							</p>
							
						}@else {
							<p class="whitespace-pre">{{token.value}}</p>
						}
					}
				}@else {
					<p class="opacity-50">{{placeHolder()}}</p>
				}
				</div>
        	</div>
    `,
	imports: [NgClass],
})
export class HighlightedInput {
	editMode = signal<boolean>(false);
	placeHolder = input<string>("value");
	text = input.required<string>();
	disabled = input.required<boolean>();
	onBlur = output<void>();
	onInput = output<string>();
	appSvc = inject(AppService);

	private tokenUpdate$ = new Subject<void>();
	private destroyRef = inject(DestroyRef);

	_tokens = signal<InputToken[]>([]);

	inputEl = viewChild.required<ElementRef<HTMLInputElement>>("inputEl");
	overlayEl = viewChild.required<ElementRef<HTMLDivElement>>("overlayEl");

	syncScroll() {
		const input = this.inputEl()?.nativeElement;
		const overlay = this.overlayEl()?.nativeElement;

		if (input && overlay) {
			overlay.scrollLeft = input.scrollLeft;
		}
	}

	handleBlur() {
		this.editMode.set(false);
		this.syncScroll();
		this.onBlur.emit();
	}

	@HostBinding("class")
	def = "flex-1 flex relative";

	@HostBinding("attr.tabindex") get f() {
		if (this.disabled()) {
			return "-1";
		}
		return "0";
	}

	handleUpdateVal(input: string) {
		this.onInput.emit(input);
	}

	@HostListener("focus")
	onHostFocus() {
		this.editMode.set(true);
		this.inputEl()?.nativeElement.focus();
	}

	initializeTokens() {
		const v = this.text();
		this._tokens.set(this.appSvc.extractEnvTokens(v));
	}

	constructor() {
		effect(() => {
			const _v = this.text();
			this.tokenUpdate$.next();
		});

		this.tokenUpdate$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(300))
			.subscribe({
				next: () => {
					this.initializeTokens();
				},
			});

		this.appSvc.activeEnvChange$
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					this.initializeTokens();
				},
			});
	}
}
