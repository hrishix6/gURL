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
import { nanoid } from "nanoid";
import { debounceTime, Subject } from "rxjs";
import type { KeyValItem } from "../../types";

@Component({
	selector: `app-bulk-keyval-editor`,
	template: `
        <textarea
        class="textarea textarea-ghost textarea-primary bg-base-300 xl:textarea-lg w-full h-full"
        [placeholder]="bulkEditInstructions"
        [value]="text()"
        (input)="handleInput($event)"
        >
        </textarea>
    `,
})
export class BulkKeyValEditor implements OnInit {
	initialValue = input<string>("");
	onChange = output<KeyValItem[]>();
	text = signal<string>("");
	notifier$ = new Subject<string>();
	destroyRef = inject(DestroyRef);
	readonly bulkEditInstructions =
		"Keep each entry on new line\nKey & value are delimited by ' : '\nStart row with '#' to keep entry disabled";

	ngOnInit(): void {
		console.log(`init`);
		this.text.set(this.initialValue());
	}

	parseTextAsKeyVal(text: string) {
		const items: KeyValItem[] = [];
		for (const line of text.split("\n")) {
			if (line.length && line.includes(":")) {
				let [key, val] = line.split(":");
				if (key) {
					let enabled = "on";
					if (key.startsWith("#")) {
						enabled = "off";
						key = key.slice(1);
					}
					items.push({
						id: nanoid(),
						key: key,
						enabled,
						val,
					});
				}
			}
		}
		return items;
	}

	constructor() {
		this.notifier$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(100))
			.subscribe({
				next: (v) => {
					this.onChange.emit(this.parseTextAsKeyVal(v));
				},
			});
	}

	handleInput(e: Event) {
		const target = e.target as HTMLTextAreaElement;
		this.text.set(target.value);
		this.notifier$.next(target.value);
	}
}
