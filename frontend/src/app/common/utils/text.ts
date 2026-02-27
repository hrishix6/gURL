import type { models } from "@wailsjs/go/models";
import { nanoid } from "nanoid";
import { getHttpExecutor } from "@/services";

export function parseTextAsKeyVal(text: string) {
	const items: models.GurlKeyValItem[] = [];
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
	return Promise.resolve(items);
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
