import { NgClass } from "@angular/common";
import {
	Component,
	computed,
	type ElementRef,
	HostBinding,
	HostListener,
	input,
	signal,
	viewChild,
} from "@angular/core";

const ENV_REGEX = /({{.*?}})/g;

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
            @if(tokens().length) {
                @for(token of tokens(); track $index) {
                    @if(token.type === 'env') {
                        <p
                        class="text-primary whitespace-pre"
                        >{{token.value}}</p
                        >
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
	editMode = signal<boolean>(true);
	placeHolder = input<string>("value");

	text = signal<string>("Hello World");

	tokens = computed(() => {
		const text = this.text();

		if (text || text.trim() !== "") {
			return text.split(ENV_REGEX).map((word) => {
				if (word.match(ENV_REGEX) !== null) {
					return {
						type: "env",
						value: word,
					};
				} else {
					return {
						type: "text",
						value: word,
					};
				}
			});
		}
		return [];
	});

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
	}

	handleFocus() {
		this.editMode.set(true);
	}

	@HostBinding("class")
	def = "flex w-56 relative";

	@HostBinding("attr.tabindex") get f() {
		return "0";
	}

	handleUpdateVal(input: string) {
		this.text.set(input);
	}

	@HostListener("focus")
	onHostFocus() {
		console.log("received focus");
		this.editMode.set(true);
		this.inputEl()?.nativeElement.focus();
	}

	@HostListener("blur")
	onHostBlur() {
		console.log("host lost focus");
	}
}
