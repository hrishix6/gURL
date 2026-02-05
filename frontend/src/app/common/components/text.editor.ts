import { Component, HostBinding, input, output } from "@angular/core";

@Component({
	selector: "gurl-text-editor",
	template: `
        <textarea
        class="textarea textarea-ghost textarea-primary bg-base-300 xl:textarea-lg w-full h-full"
        [value]="value()"
        (input)="handleInput($event)"
		[readonly]="readonly()"
        >
        </textarea>
    `,
})
export class TextEditor {
	@HostBinding("class")
	hostClass = "w-full h-full";

	value = input.required<string>();
	onInput = output<Event>();
	readonly = input.required<boolean>();

	protected handleInput(e: Event) {
		this.onInput.emit(e);
	}
}
