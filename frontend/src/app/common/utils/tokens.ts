import {
	COMBINED_ENV_PATH_REGEX,
	ENV_TOKEN_REGEX,
	ENV_VAR_REGEX,
	PATH_TOKEN_REGEX,
	PATH_VAR_REGEX,
} from "@/constants";
import type { InputToken } from "@/types";

export function extractTokens(v?: string): InputToken[] {
	const tokens: InputToken[] = [];

	if (!v || v.trim() === "") {
		return tokens;
	}

	const parts = v.split(COMBINED_ENV_PATH_REGEX);

	for (const part of parts) {
		if (!part || part === "") {
			continue;
		}

		if (part.match(ENV_TOKEN_REGEX) !== null) {
			const innerVal = part.match(ENV_VAR_REGEX);
			const varKey = innerVal ? innerVal[1] : "";
			tokens.push({
				type: "env",
				key: varKey,
				value: part,
				valid: false,
				interpolated: "",
			});
		} else if (part.match(PATH_TOKEN_REGEX) !== null) {
			const innerVal = part.match(PATH_VAR_REGEX);
			const varKey = innerVal ? innerVal[1] : "";
			tokens.push({
				type: "path",
				key: varKey,
				value: part,
				valid: false,
				interpolated: "",
			});
		} else {
			tokens.push({
				type: "text",
				value: part,
				valid: true,
				key: "",
				interpolated: "",
			});
		}
	}

	return tokens;
}
