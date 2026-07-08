import { StateEffect } from "@codemirror/state";
import {
	Decoration,
	type DecorationSet,
	hoverTooltip,
	ViewPlugin,
} from "@codemirror/view";

import { ENV_VAR_REGEX2 } from "@/constants";

const variableValid = Decoration.mark({
	class: "cm-variable-valid",
});

const variableMissing = Decoration.mark({
	class: "cm-variable-missing",
});

export const recomputeVariables = StateEffect.define<void>();

export const getVariableHighligher = (
	resolver: (s: string) => [v: string, ok: boolean],
) => {
	return ViewPlugin.fromClass(
		class {
			decorations: DecorationSet;

			constructor(view: any) {
				this.decorations = this.buildDecorations(view);
			}

			update(update: any) {
				let shouldRebuild = update.docChanged || update.viewportChanged;

				for (const tr of update.transactions) {
					for (const e of tr.effects) {
						if (e.is(recomputeVariables)) {
							shouldRebuild = true;
						}
					}
				}

				if (shouldRebuild) {
					this.decorations = this.buildDecorations(update.view);
				}
			}

			buildDecorations(view: any) {
				const builder = [];
				const text = view.state.doc.toString();
				let match: RegExpExecArray | null;
				ENV_VAR_REGEX2.lastIndex = 0;

				while ((match = ENV_VAR_REGEX2.exec(text)) !== null) {
					const from = match.index;
					const to = from + match[0].length;
					const varName = match[1];

					const [_, ok] = resolver(varName);

					if (ok) {
						builder.push(variableValid.range(match.index, to));
					} else {
						builder.push(variableMissing.range(match.index, to));
					}
				}

				console.log("matches:", builder.length);

				return Decoration.set(builder);
			}
		},
		{
			decorations: (v) => v.decorations,
		},
	);
};

export const getVariableTooltiper = (
	resolver: (s: string) => [v: string, ok: boolean],
) => {
	return hoverTooltip((view, pos) => {
		const text = view.state.doc.toString();
		let match: RegExpExecArray | null;

		while ((match = ENV_VAR_REGEX2.exec(text)) !== null) {
			const start = match.index;
			const end = start + match[0].length;

			if (pos >= start && pos <= end) {
				const varName = match[1];
				const [resolvedValue, _ok] = resolver(varName);

				return {
					pos: start,
					end,
					create() {
						const tooltip = document.createElement("div");
						tooltip.className = "bg-base-100 p-2 text-sm text-primary";
						tooltip.textContent = `${resolvedValue}`;
						return { dom: tooltip };
					},
				};
			}
		}
		return null;
	});
};
