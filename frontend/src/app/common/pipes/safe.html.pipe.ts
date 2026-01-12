import { inject, Pipe, type PipeTransform } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({ name: "safe" })
export class SafePipe implements PipeTransform {
	domSanitizer = inject(DomSanitizer);
	transform(url?: string) {
		return this.domSanitizer.bypassSecurityTrustResourceUrl(url || "");
	}
}
