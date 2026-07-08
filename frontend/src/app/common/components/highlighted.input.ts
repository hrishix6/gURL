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
	type OnInit,
	output,
	signal,
	viewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime, Subject } from "rxjs";
import type { InputToken } from "@/types";
import { TooltipDirective } from "./tooltip";

@Component({
	selector: `div[gurl-highlighted-input]`,
	template: `
		@if(readonly()) {
			<input
				type="text"
				[placeholder]="placeHolder()"
				[ngClass]="{
					'input input-md flex-1 input-ghost bg-base-300 input-primary': true,
					'input-error': invalid()
				}"
				[value]="text()"
				[disabled]="disabled()"
				[readOnly]="readonly()"
				
        	/>
		}
		@else {
			<input
				type="text"
				[placeholder]="placeHolder()"
				[ngClass]="{
					'input input-md flex-1 input-ghost bg-base-300 input-primary': true,
				}"
				[value]="text()"
				(blur)="handleBlur()"
				(input)="handleUpdateVal($event.target.value)"
				#inputEl
				[disabled]="disabled()"
        	/>
			<div
				[ngClass]="{
					'absolute top-0 left-0 w-full h-full flex rounded-box items-center overflow-hidden z-10 px-3 border bg-base-300': true,
					'opacity-0 pointer-events-none': editMode(),
					'opacity-100': !editMode(),
					'border-base-300': !invalid(),
					'border-red-500': invalid()
				}"
        	>   
			<div
				[ngClass]="{
					'input-md overflow-x-auto no-scrollbar whitespace-nowrap flex': true,
			}"
			#overlayEl
			>
				@if(_tokens().length) {
					@for(token of _tokens(); track $index) {
						@if(token.type === "env") {
							<span
									[ngClass]="{
										'whitespace-pre': true,
										'text-primary': token.valid,
										'text-error': !token.valid
									}"
									gurlTooltip
									[tooltip]="token.valid && token.interpolated? token.interpolated: 'undefined'"
									[position]="'bottom'"
									>{{token.value}}</span>
						}@else {
							<span class="whitespace-pre">{{token.value}}</span>
						}
					}
				}@else {
					<span class="opacity-50">{{placeHolder()}}</span>
				}
				</div>
        	</div>
		}
    `,
	imports: [NgClass, TooltipDirective],
})
export class GurlHighlightedInput implements OnInit {
	@HostBinding("class")
	def = "flex-1 flex relative";

	@HostBinding("attr.tabindex") get f() {
		if (this.disabled()) {
			return "-1";
		}
		return "0";
	}

	@HostListener("focus")
	onHostFocus() {
		this.editMode.set(true);
		this.inputEl()?.nativeElement.focus();
	}

	placeHolder = input<string>("value");
	extractTokensFn = input.required<(v: string) => InputToken[]>();
	activeEnvSub = input.required<Subject<void>>();
	text = input.required<string>();
	disabled = input.required<boolean>();
	readonly = input<boolean>(false);
	onBlur = output<void>();
	onInput = output<string>();
	invalid = input<boolean>(false);

	constructor() {
		effect(() => {
			const _v = this.text();
			this.tokenUpdate$.next();
		});

		this.tokenUpdate$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(100))
			.subscribe({
				next: () => {
					this.initializeTokens();
				},
			});
	}

	ngOnInit(): void {
		this.activeEnvSub()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					this.initializeTokens();
				},
			});
	}

	protected editMode = signal<boolean>(false);
	private readonly tokenUpdate$ = new Subject<void>();
	private readonly destroyRef = inject(DestroyRef);
	protected _tokens = signal<InputToken[]>([]);
	private inputEl = viewChild.required<ElementRef<HTMLInputElement>>("inputEl");
	private overlayEl =
		viewChild.required<ElementRef<HTMLDivElement>>("overlayEl");

	protected syncScroll() {
		const input = this.inputEl()?.nativeElement;
		const overlay = this.overlayEl()?.nativeElement;

		if (input && overlay) {
			overlay.scrollLeft = input.scrollLeft;
		}
	}

	protected handleBlur() {
		this.editMode.set(false);
		this.syncScroll();
		this.onBlur.emit();
	}

	protected handleUpdateVal(input: string) {
		this.onInput.emit(input);
	}

	protected initializeTokens() {
		const v = this.text();
		// this._tokens.set(this.formSvc.extractTokens(v));
		this._tokens.set(this.extractTokensFn()(v));
	}
}
