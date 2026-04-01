import { computed, Injectable, inject, signal } from "@angular/core";
import { AppService, RestClient } from "@/services";
import type { LoginRequestDTO, RegisterDTO } from "@/types";

@Injectable({
	providedIn: "root",
})
export class UserAuthService {
	private _isLoggedIn = signal<boolean>(false);
	private readonly appSvc = inject(AppService);
	private readonly restClient: RestClient;
	public isLoggedIn = computed(() => this._isLoggedIn());

	constructor() {
		this.restClient = RestClient.getInstance();
	}

	async tryLogin(p: LoginRequestDTO) {
		try {
			await this.restClient.authPost<string>("login", p);
			this._isLoggedIn.set(true);
			return true;
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	async tryRegister(p: RegisterDTO) {
		try {
			await this.restClient.authPost("register", p);
			return true;
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	async logout() {
		try {
			await this.restClient.authPost("logout", undefined);
			this.appSvc.clean();
			return true;
		} catch (error) {
			console.error(error);
			return false;
		}
	}
}
