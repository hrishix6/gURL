import {
	Component,
	DestroyRef,
	inject,
	input,
	type OnInit,
	output,
	signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { models } from "@wailsjs/go/models";
import { debounceTime, Subject } from "rxjs";

@Component({
	selector: `gurl-bulk-editor`,
	template: `
        <textarea
        class="textarea textarea-ghost textarea-primary bg-base-300 xl:textarea-lg w-full h-full"
        [placeholder]="editInstructions()"
        [value]="text()"
        (input)="handleInput($event)"
        >
        </textarea>
    `,
})
export class BulkKeyValEditor implements OnInit {
	initialValue = input<string>("");
	onChange = output<models.GurlKeyValItem[]>();
	text = signal<string>("");
	notifier$ = new Subject<string>();
	destroyRef = inject(DestroyRef);
	editInstructions = input.required<string>();
	parseFn = input.required<(t: string) => Promise<models.GurlKeyValItem[]>>();

	ngOnInit(): void {
		this.text.set(this.initialValue());
	}

	constructor() {
		this.notifier$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					this.parseFn()(v).then((d) => {
						this.onChange.emit(d);
					});
				},
			});
	}

	protected handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		this.text.set(target.value);
		this.notifier$.next(target.value);
	}
}
