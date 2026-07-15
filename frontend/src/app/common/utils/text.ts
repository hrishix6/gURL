import type { models } from "@wailsjs/go/models";
import { nanoid } from "nanoid";
import xmlFormatter from "xml-formatter";
import { getHttpExecutor } from "@/services";
import type { EnvironmentItem } from "@/types";

export function envItemsToBulkEditText(
	items: EnvironmentItem[],
	skipId: string,
) {
	return items.reduce((acc, curr) => {
		if (curr.id !== skipId) {
			if (curr.key) {
				acc += `${curr.key}=${curr.isSecret ? "#" : ""}${curr.val}\n`;
			}
		}
		return acc;
	}, "");
}

export function parseTextAsEnvVariables(text: string) {
	const items: EnvironmentItem[] = [];
	for (const line of text.split("\n")) {
		if (line.length && line.includes("=")) {
			let [key, val] = line.split("=");
			if (key) {
				let isSecret = false;
				if (val && val.length > 0 && val.startsWith("#")) {
					isSecret = true;
					val = val.slice(1);
				}
				items.push({
					id: nanoid(),
					key: key,
					description: "",
					isSecret,
					val,
				});
			}
		}
	}
	return Promise.resolve(items);
}

export function keyValToBulkEditText(
	items: models.GurlKeyValItem[],
	skipId: string,
): string {
	return items.reduce((acc, curr) => {
		if (curr.id !== skipId) {
			if (curr.key) {
				acc += `${curr.enabled === "on" ? "" : "#"}${curr.key}=${curr.val}\n`;
			}
		}
		return acc;
	}, "");
}

export function parseTextAsKeyVal(text: string) {
	const items: models.GurlKeyValItem[] = [];
	for (const line of text.split("\n")) {
		if (line.length && line.includes("=")) {
			let [key, val] = line.split("=");
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
	return Promise.resolve(items);
}

export function cookieItemsToBulkEditText(
	items: models.GurlKeyValItem[],
	skipId: string,
): string {
	return items.reduce((prev, curr) => {
		if (curr.id !== skipId) {
			prev += `${curr.key}=${curr.val};`;
		}
		return prev;
	}, "");
}

export async function parseTextAsCookies(
	text: string,
): Promise<models.GurlKeyValItem[]> {
	try {
		const httpExec = getHttpExecutor();
		const results = await httpExec.parseCookieRaw(text);
		if (Array.isArray(results)) {
			const parsed = results.map((x) => ({
				id: nanoid(),
				key: x.key,
				val: x.val,
				enabled: x.enabled,
			}));

			return parsed;
		}
		return [];
	} catch (_error) {
		return [];
	}
}

export function copyTextToClipboard(text: string): Promise<void> {
	if (navigator.clipboard) {
		return navigator.clipboard.writeText(text);
	}

	return new Promise((res, rej) => {
		const textArea = document.createElement("textarea");
		textArea.value = text;
		textArea.style.position = "fixed";
		textArea.style.top = "-9999px";
		textArea.style.left = "-9999px";
		document.body.appendChild(textArea);
		textArea.focus();
		textArea.select();
		try {
			const s = document.execCommand("copy");
			if (!s) {
				return rej(new Error("failed to copy"));
			}
			res();
		} catch (error) {
			rej(error);
		} finally {
			document.body.removeChild(textArea);
		}
	});
}

export function beautifyJSON(text: string) {
	try {
		return JSON.stringify(JSON.parse(text), null, 2);
	} catch (_error) {
		return text;
	}
}

export function beautifyXML(text: string) {
	try {
		return xmlFormatter(text, { strictMode: false, throwOnFailure: true });
	} catch (_error) {
		return text;
	}
}
