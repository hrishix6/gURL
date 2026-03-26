import { NgClass } from "@angular/common";
import { Component, inject, input, type OnInit } from "@angular/core";
import { Check, CircleX, LucideAngularModule } from "lucide-angular";
import { AlertService } from "@/services";
import type { Alert as AlertData } from "@/types";

@Component({
	selector: "gurl-alert",
	template: `
        <div [ngClass]="{
          'alert alert-soft': true,
          'alert-success': data().type === 'success',
          'alert-error': data().type === 'error',
		  'alert-animated': !!data().selfDestruct
        }">
          <lucide-angular [img]="data().type === 'success' ? CheckIcon : FailedIcon" class="size-5" />
          <span>{{data().message}}</span>
        </div>
    `,
	imports: [NgClass, LucideAngularModule],
})
export class Alert implements OnInit {
	data = input.required<AlertData>();

	ngOnInit(): void {
		if (this.data().selfDestruct) {
			setTimeout(() => {
				this.alertSvc.removeAlert(this.data().id);
			}, this.data().selfDestructTimeMS);
		}
	}
	private readonly alertSvc = inject(AlertService);
	protected readonly FailedIcon = CircleX;
	protected readonly CheckIcon = Check;
}
