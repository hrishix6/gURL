import {
	type AfterViewInit,
	Component,
	type ElementRef,
	effect,
	HostBinding,
	inject,
	input,
	type OnDestroy,
	output,
	viewChild,
} from "@angular/core";
import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import { vsCodeDark } from "@fsegurai/codemirror-theme-vscode-dark";
import { basicSetup, EditorView } from "codemirror";
import { AppService } from "@/services";
import type { AppTheme } from "@/types";

@Component({
	selector: "gurl-code-editor",
	template: `
        <div class="h-full w-full overflow-hidden" #gurl_code_editor></div>
    `,
})
export class CodeEditor implements AfterViewInit, OnDestroy {
	@HostBinding("class")
	def = "flex-1 overflow-hidden";

	codeEditorRef =
		viewChild.required<ElementRef<HTMLDivElement>>("gurl_code_editor");
	mode = input.required<"json" | "xml">();
	placeHolder = input<string>("");
	onChange = output<string>();
	readonly = input<boolean>(false);

	private editorView: EditorView | null = null;
	private themeCompartment = new Compartment();
	private readOnlyCompartment = new Compartment();

	ngAfterViewInit(): void {
		const el = this.codeEditorRef().nativeElement;
		const currentTheme = this.appSvc.activeTheme();
		const exts: Extension = [
			basicSetup,
			this.mode() === "json" ? json() : xml(),
			this.themeCompartment.of(this.getThemeExtension(currentTheme)),
			this.readOnlyCompartment.of(EditorState.readOnly.of(this.readonly())),
			EditorView.theme({
				"&": { "max-height": "100%" },
				".cm-scroller": { overflow: "auto" },
			}),
			EditorView.updateListener.of((update) => {
				if (update.docChanged) {
					const content = update.state.doc.toString();
					this.onChange.emit(content);
				}
			}),
		];

		const state = EditorState.create({
			doc: this.placeHolder(),
			extensions: exts,
		});

		this.editorView = new EditorView({
			state,
			parent: el,
		});
	}

	ngOnDestroy(): void {
		this.editorView?.destroy();
	}

	constructor() {
		effect(() => {
			const activeTheme = this.appSvc.activeTheme();
			this.updateTheme(activeTheme);
		});

		effect(() => {
			const isReadOnly = this.readonly();
			this.updateReadOnly(isReadOnly);
		});
	}

	private readonly appSvc = inject(AppService);

	private getThemeExtension(_: AppTheme | null): Extension {
		return vsCodeDark;
	}

	private updateReadOnly(isreadOnly: boolean) {
		if (!this.editorView) return;
		this.editorView.dispatch({
			effects: this.readOnlyCompartment.reconfigure(
				EditorState.readOnly.of(isreadOnly),
			),
		});
	}

	private updateTheme(appTheme: AppTheme | null) {
		if (!this.editorView) return;
		this.editorView.dispatch({
			effects: this.themeCompartment.reconfigure(
				this.getThemeExtension(appTheme),
			),
		});
	}
}
