import { Pipe, type PipeTransform } from "@angular/core";
import { humanBytes } from "../utils/time";

@Pipe({
	name: "bytes",
})
export class BytesPipe implements PipeTransform {
	transform(value: number | null | undefined, decimals: number = 1): string {
		return humanBytes(value, decimals);
	}
}
