import { Component, HostBinding, input } from "@angular/core";

@Component({
	selector: `div[methodTag]`,
	template: `{{ method() }}`,
})
export class ReqMethodTag {
	method = input.required<string>();
	size = input<"xs" | "sm" | "md" | "xl">("md");

	@HostBinding("class") get classes() {
		const def: string[] = [
			"flex items-center",
			"px-1",
			"border-1",
			"font-medium",
			"tracking-wide",
			`rounded-full`,
		];

		switch (this.method()) {
			case "GET": {
				def.push(`text-[#10b67f] bg-[#032419] border-[#0A7653]`);
				break;
			}
			case "POST": {
				def.push(`text-[#d5a207] bg-[#201801] border-[#806104]`);
				break;
			}
			case "PUT": {
				def.push(`text-[#0d95d3] bg-[#032535] border-[#086189]`);
				break;
			}
			case "PATCH": {
				def.push(`text-[#744dcd] bg-[#170F29] border-[#573A9A]`);
				break;
			}
			case "DELETE": {
				def.push(`text-[#e13b57] bg-[#380F16] border-[#A92C41]`);
				break;
			}
			case "HEAD": {
				def.push(`text-[#6D6D75] bg-[#161617] border-[#47474C]`);
				break;
			}
			case "OPTIONS": {
				def.push(`text-[#6366f0] bg-[#141430] border-[#4547A8]`);
				break;
			}
		}

		switch (this.size()) {
			case "xs": {
				def.push(`text-[0.60rem]`);
				break;
			}
			case "sm": {
				def.push(`text-[0.75rem]`);
				break;
			}
			case "md": {
				def.push(`text-[1rem]`);
				break;
			}
			case "xl": {
				def.push(`text-[1.25rem]`);
				break;
			}
		}

		return def.join(" ");
	}
}
