import {
	Component,
	effect,
	inject,
	type OnDestroy,
	signal,
} from "@angular/core";
import { DEMO_USER_SESSION_MAX_MINS } from "@/constants";
import { UserAuthService } from "@/services";

@Component({
	selector: "gurl-demo-session-progress",
	template: `
        <div class="bg-base-300 px-2">
            <span class="mr-2 text-sm">Session</span>
            @if(determiningTime()){
                <progress class="progress w-52"></progress>
            } @else {
                <progress class="progress w-52 progress-success" [value]="elapsedMins()" [max]="max"></progress>
            }
        </div>
    `,
})
export class GurlDemoSessionProgress implements OnDestroy {
	protected readonly max = DEMO_USER_SESSION_MAX_MINS;

	protected intervalId: number | null = null;
	protected readonly determiningTime = signal<boolean>(false);
	private readonly userAuthSvc = inject(UserAuthService);

	protected readonly elapsedMins = signal<number>(0);

	constructor() {
		effect(() => {
			const userInfo = this.userAuthSvc.userInfo();
			console.log(`starting demo session timer`);
			this.determiningTime.set(true);
			if (userInfo) {
				this.intervalId = setInterval(() => {
					const startTime = userInfo.sessionStartUnix;
					const endTime = new Date(startTime);
					endTime.setMinutes(endTime.getMinutes() + DEMO_USER_SESSION_MAX_MINS);

					const currentTime = Date.now();

					const remainingMins = (endTime.getTime() - currentTime) / (60 * 1000);

					console.log(`remaining mins: ${remainingMins}`);

					const elapsedMins = DEMO_USER_SESSION_MAX_MINS - remainingMins;

					this.elapsedMins.set(elapsedMins);

					this.determiningTime.set(false);

					if (remainingMins < 0) {
						console.log(`demo session time as ended`);
						this.cleanUp();
					}
				}, 10000);
			}
			return () => {
				this.cleanUp();
			};
		});
	}

	cleanUp() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
		}
	}

	ngOnDestroy(): void {
		this.cleanUp();
	}
}
