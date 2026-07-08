import {
	type AfterViewInit,
	Component,
	DestroyRef,
	type ElementRef,
	effect,
	HostBinding,
	inject,
	input,
	type OnDestroy,
	type OnInit,
	output,
	viewChild,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";
import { Compartment, EditorState, type Extension } from "@codemirror/state";
import { basicSetup, EditorView } from "codemirror";
import type { Subject } from "rxjs";
import { beautifyJSON, beautifyXML } from "@/common/utils/text";
import type { ReqBodyType } from "@/types";
import { theme } from "./code.editor.theme";
import {
	getVariableHighligher,
	getVariableTooltiper,
	recomputeVariables,
} from "./code.highlighter.plugin";

@Component({
	selector: "gurl-code-editor",
	template: `
        <div class="h-full w-full overflow-hidden" #gurl_code_editor></div>
    `,
})
export class CodeEditor implements OnInit, AfterViewInit, OnDestroy {
	@HostBinding("class")
	def = "flex-1 overflow-hidden";

	destroyRef = inject(DestroyRef);

	codeEditorRef =
		viewChild.required<ElementRef<HTMLDivElement>>("gurl_code_editor");

	mode = input.required<ReqBodyType>();
	placeHolder = input<string>("");
	envChange$ = input.required<Subject<void>>();
	formatText$ = input<Subject<void>>();
	text = input.required<string>();
	onChange = output<string>();
	readonly = input<boolean>(false);
	resolveVar = input<(s: string) => [v: string, ok: boolean]>((_s) => [
		"undefined",
		false,
	]);

	disableVariableHighlight = input<boolean>(false);

	private editorView: EditorView | null = null;
	private themeCompartment = new Compartment();
	private readOnlyCompartment = new Compartment();
	private langCompartment = new Compartment();

	ngOnInit(): void {
		this.envChange$()
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: () => {
					if (!this.editorView) return;
					this.editorView.dispatch({
						effects: recomputeVariables.of(),
					});
				},
			});

		this.formatText$()?.subscribe({
			next: () => {
				if (!this.editorView) return;
				const current = this.editorView.state.doc.toString();
				this.editorView.dispatch({
					changes: {
						from: 0,
						to: this.editorView.state.doc.length,
						insert: this.handleTextFormatting(current),
					},
				});
			},
		});
	}

	ngAfterViewInit(): void {
		const el = this.codeEditorRef().nativeElement;
		const exts: Extension = [
			basicSetup,
			this.langCompartment.of([]),
			this.readOnlyCompartment.of(EditorState.readOnly.of(this.readonly())),
			this.themeCompartment.of(theme),
			EditorView.updateListener.of((update) => {
				if (update.docChanged) {
					const content = update.state.doc.toString();
					this.onChange.emit(content);
				}
			}),
		];

		const v = this.text() || this.placeHolder() || "";

		const state = EditorState.create({
			doc: v,
			extensions: exts,
		});

		this.editorView = new EditorView({
			state,
			parent: el,
		});

		this.updateLang(this.mode());
	}

	ngOnDestroy(): void {
		this.editorView?.destroy();
	}

	constructor() {
		effect(() => {
			const isReadOnly = this.readonly();
			this.updateReadOnly(isReadOnly);
		});

		effect(() => {
			const updatedmode = this.mode();
			this.updateLang(updatedmode);
		});
	}

	private updateReadOnly(isreadOnly: boolean) {
		if (!this.editorView) return;
		this.editorView.dispatch({
			effects: this.readOnlyCompartment.reconfigure(
				EditorState.readOnly.of(isreadOnly),
			),
		});
	}

	private updateLang(t: ReqBodyType) {
		if (!this.editorView) return;

		const disableVariableSupport = this.disableVariableHighlight();
		const jsonSupport = json();
		const xmlSupport = xml();
		const varTooltiper = getVariableTooltiper(this.resolveVar());
		const varHighlighter = getVariableHighligher(this.resolveVar());

		switch (t) {
			case "json": {
				this.editorView.dispatch({
					effects: this.langCompartment.reconfigure([
						jsonSupport,
						...(disableVariableSupport ? [] : [varHighlighter, varTooltiper]),
					]),
				});
				return;
			}
			case "xml": {
				this.editorView.dispatch({
					effects: this.langCompartment.reconfigure([
						xmlSupport,
						...(disableVariableSupport ? [] : [varHighlighter, varTooltiper]),
					]),
				});
				return;
			}
			default: {
				this.editorView.dispatch({
					effects: this.langCompartment.reconfigure([
						xmlSupport,
						...(disableVariableSupport ? [] : [varHighlighter, varTooltiper]),
					]),
				});
				return;
			}
		}
	}

	private handleTextFormatting(text: string): string {
		const t = this.mode();
		switch (t) {
			case "json": {
				return beautifyJSON(text);
			}
			case "xml": {
				return beautifyXML(text);
			}
			default: {
				return text;
			}
		}
	}
}
