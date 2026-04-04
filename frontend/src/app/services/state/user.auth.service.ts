import { computed, Injectable, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "@src/environments/environment";
import { loadConfig } from "@/app.config";
import { AlertService, AppService, RestClient } from "@/services";
import type { LoginRequestDTO, RegisterDTO, UserInfo } from "@/types";

@Injectable({
	providedIn: "root",
})
export class UserAuthService {
	private _isLoggedIn = signal<boolean>(false);
	private readonly appSvc = inject(AppService);
	private readonly alertSvc = inject(AlertService);
	private readonly restClient: RestClient;
	public isLoggedIn = computed(() => this._isLoggedIn());
	private _userInfo = signal<UserInfo | null>(null);
	public userInfo = computed(() => this._userInfo());
	private readonly router = inject(Router);

	constructor() {
		this.restClient = RestClient.getInstance();
	}

	async tryLogin(p: LoginRequestDTO) {
		let loginCode = "";
		try {
			const loginResponse = await this.restClient.authPost<string>("login", p);

			if (!loginResponse.success) {
				throw new Error(`error from backend: ${loginResponse.error.message}`);
			}

			if (environment.env === "dev") {
				const magicLink = loginResponse.data;
				window.location.href = magicLink;
				return;
			}

			loginCode = "ok_magic_link";
			this.router.navigate(["/login"], { queryParams: { code: loginCode } });
		} catch (error) {
			console.error(error);
			loginCode = "err_magic_link";
			this.router.navigate(["/login"], { queryParams: { code: loginCode } });
		}
	}

	async tryAdminUserSetup(p: RegisterDTO) {
		let loginCode = "";
		try {
			await this.restClient.authPost("register/admin", p);
			await loadConfig();
			loginCode = "ok_setup";
		} catch (error) {
			console.error(error);
			loginCode = "err_setup";
		} finally {
			this.router.navigate(["/login"], { queryParams: { code: loginCode } });
		}
	}

	async logout() {
		try {
			await this.restClient.authPost("logout", undefined);
			this._isLoggedIn.set(false);
			this._userInfo.set(null);
			this.appSvc.clean();
			return true;
		} catch (error) {
			console.error(error);
			return false;
		}
	}

	async checkLogin() {
		try {
			const loginCheckResponse = await this.restClient.checkIfLoggedIn();

			if (!loginCheckResponse.success) {
				return false;
			}

			const userInfo = loginCheckResponse.data;

			if (!userInfo) {
				return false;
			}

			this._isLoggedIn.set(true);
			this._userInfo.set(userInfo);
			return true;
		} catch (_error) {
			return false;
		}
	}

	async inviteUser(email: string) {
		try {
			const response = await this.restClient.post("admin/invite", {
				email,
			});

			if (!response.success) {
				console.error(response.error.message);
				this.alertSvc.addAlert("failed to invite user", "error");
				return;
			}

			this.alertSvc.addAlert(`invited user ${email}`, "success");
		} catch (error) {
			console.error(error);
			this.alertSvc.addAlert("failed to invite user", "error");
		}
	}
}
