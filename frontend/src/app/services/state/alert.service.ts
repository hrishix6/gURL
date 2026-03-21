import { computed, Injectable, signal } from "@angular/core";
import { nanoid } from "nanoid";
import type { Alert } from "@/types";

@Injectable({
	providedIn: "root",
})
export class AlertService {
	private _alerts = signal<Alert[]>([]);

	public alerts = computed(() => this._alerts());

	addAlert(message: string, type: "success" | "error") {
		const alert: Alert = {
			id: nanoid(),
			message,
			type,
		};
		this._alerts.update((prev) => [...prev, alert]);
	}

	addStickyAlert(message: string, type: "success" | "error") {
		const alert: Alert = {
			id: nanoid(),
			message,
			type,
			selfDestruct: false,
		};
		this._alerts.update((prev) => [...prev, alert]);
	}

	removeAlert(alertId: string) {
		this._alerts.update((prev) => prev.filter((alert) => alert.id !== alertId));
	}
}
