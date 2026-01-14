import { ParseCookieRaw } from "@wailsjs/go/executor/Executor";
import { nanoid } from "nanoid";
import type { KeyValItem } from "@/types";

export function humanTime(date: number | null | undefined): string {
	if (date == null || Number.isNaN(date)) return "";

	if (date === 0) return "just now";

	const now = new Date();
	const elapsedMilliseconds = now.getTime() - date;

	// Define time intervals in milliseconds
	const second = 1000;
	const minute = 60 * 1000;
	const hour = 60 * minute;
	const day = 24 * hour;
	const week = 7 * day;
	const month = 30.44 * day;
	const year = 365.25 * day;

	if (elapsedMilliseconds < second) {
		return "just now";
	}
	if (elapsedMilliseconds < minute) {
		const seconds = Math.floor(elapsedMilliseconds / 1000);
		return `${seconds}s ago`;
	} else if (elapsedMilliseconds < hour) {
		const minutes = Math.floor(elapsedMilliseconds / minute);
		return `${minutes}m ago`;
	} else if (elapsedMilliseconds < day) {
		const hours = Math.floor(elapsedMilliseconds / hour);
		return `${hours}h ago`;
	} else if (elapsedMilliseconds < week) {
		const days = Math.floor(elapsedMilliseconds / day);
		return `${days}d ago`;
	} else if (elapsedMilliseconds < month) {
		const weeks = Math.floor(elapsedMilliseconds / week);
		return `${weeks}w ago`;
	} else if (elapsedMilliseconds < year) {
		const months = Math.floor(elapsedMilliseconds / month);
		return `${months}mo ago`;
	} else {
		const years = Math.floor(elapsedMilliseconds / year);
		return `${years}y ago`;
	}
}

export function humanBytes(value?: number | null, decimals: number = 2) {
	if (value == null || Number.isNaN(value)) return "";

	if (value === 0) return "0 bytes";

	const k = 1000;
	const sizes = ["bytes", "Kb", "Mb", "Gb", "Tb", "Pb"];
	const i = Math.floor(Math.log(value) / Math.log(k));

	const converted = (value / k ** i).toFixed(decimals);

	return `${converted} ${sizes[i]}`;
}

export function parseTextAsKeyVal(text: string) {
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
	return Promise.resolve(items);
}

export async function parseTextAsCookies(text: string): Promise<KeyValItem[]> {
	try {
		const results = await ParseCookieRaw(text);
		if (Array.isArray(results)) {
			const parsed = results.map((x) => ({
				id: nanoid(),
				key: x.key,
				val: x.value,
				enabled: x.enabled ? "on" : "off",
			}));

			console.log(JSON.stringify(parsed));
			return parsed;
		}
		return [];
	} catch (_error) {
		return [];
	}
}
