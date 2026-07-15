import { NgClass } from "@angular/common";
import { Component, inject, input, type OnInit } from "@angular/core";
import { AlertService } from "@/services";
import type { Alert as AlertData } from "@/types";
import { SystemIconComponent } from "./icon";

@Component({
	selector: "gurl-alert",
	template: `
        <div [ngClass]="{
          'alert alert-soft': true,
          'alert-success': data().type === 'success',
          'alert-error': data().type === 'error',
		  'alert-animated': !!data().selfDestruct
        }">
		  @switch (data().type) {
			@case ("success") {
				<i gurl-icon [icon]="'Success'" [className]="'size-5'" ></i>
			}
			@case ('error') {
				<i gurl-icon [icon]="'Failed'" [className]="'size-5'" ></i>
			}
		  }
          <span>{{data().message}}</span>
        </div>
    `,
	imports: [NgClass, SystemIconComponent],
})
export class Alert implements OnInit {
	public data = input.required<AlertData>();

	private readonly alertSvc = inject(AlertService);

	ngOnInit(): void {
		if (this.data().selfDestruct) {
			setTimeout(() => {
				this.alertSvc.removeAlert(this.data().id);
			}, this.data().selfDestructTimeMS);
		}
	}
}
