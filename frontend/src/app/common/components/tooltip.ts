import {
	type ConnectedPosition,
	Overlay,
	type OverlayRef,
} from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import {
	Component,
	Directive,
	ElementRef,
	HostListener,
	inject,
	input,
	ViewContainerRef,
} from "@angular/core";

@Component({
	selector: "gurl-tooltip",
	template: `
  <div [class]="className()">{{ text() }}</div>`,
})
export class Tooltip {
	text = input.required<string>();
	className = input.required<string>();
}

@Directive({
	selector: "[gurlTooltip]",
})
export class TooltipDirective {
	tooltip = input.required<string>();
	classname = input<string>("bg-base-100 p-2 text-sm text-primary");
	position = input<"top" | "bottom" | "left" | "right">("top");

	private overlayRef: OverlayRef | null = null;
	private overlay = inject(Overlay);
	private el = inject(ElementRef);
	private containerRef = inject(ViewContainerRef);

	private getPositions() {
		const position: ConnectedPosition[] = [];
		switch (this.position()) {
			case "top":
				position.push({
					originX: "center",
					originY: "top",
					overlayX: "center",
					overlayY: "bottom",
					offsetY: -8,
				});
				break;

			case "bottom":
				position.push({
					originX: "center",
					originY: "bottom",
					overlayX: "center",
					overlayY: "top",
					offsetY: 8,
				});
				break;
			case "left":
				position.push({
					originX: "start",
					originY: "center",
					overlayX: "end",
					overlayY: "center",
					offsetX: -8,
				});
				break;

			case "right":
				position.push({
					originX: "end",
					originY: "center",
					overlayX: "start",
					overlayY: "center",
					offsetX: 8,
				});
				break;
		}
		return position;
	}

	@HostListener("mouseenter")
	show() {
		if (this.overlayRef) return;

		const positionStrategy = this.overlay
			.position()
			.flexibleConnectedTo(this.el)
			.withPositions(this.getPositions());

		this.overlayRef = this.overlay.create({
			positionStrategy,
			hasBackdrop: false,
		});

		const portal = new ComponentPortal(Tooltip, this.containerRef);
		const componentRef = this.overlayRef.attach(portal);
		componentRef.instance.text = this.tooltip;
		componentRef.instance.className = this.classname;
	}

	@HostListener("mouseleave")
	hide() {
		this.overlayRef?.dispose();
		this.overlayRef = null;
	}
}
