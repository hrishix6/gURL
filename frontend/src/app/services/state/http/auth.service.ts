import { computed, type DestroyRef, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { models } from "@wailsjs/go/models";
import { debounceTime, Subject } from "rxjs";
import { API_KEY_LOCATION, REQ_AUTH_TYPES } from "@/constants";
import { getReqRepository } from "@/services";
import type {
	ApiKeyAuth,
	BasicAuth,
	DropDownItem,
	RequestAuthType,
	TokenAuth,
} from "@/types";

export class AuthService {
	private draftId = "";
	private destroyRef: DestroyRef;
	private authEnabledDbSync$ = new Subject<boolean>();
	private authTypeDbSync$ = new Subject<RequestAuthType>();
	private tokenAuthDbSync$ = new Subject<TokenAuth>();
	private apiKeyDbSync$ = new Subject<ApiKeyAuth>();
	private basicDbSync$ = new Subject<BasicAuth | null>();
	private reqRepo = getReqRepository();

	public init(data: models.RequestDraftDTO) {
		const { id, authEnabled, authType, basicAuth, apiKeyAuth, tokenAuth } =
			data;
		this.draftId = id;
		this._authEnabled.set(authEnabled);
		this._auth.set(
			REQ_AUTH_TYPES.find((x) => x.id === authType) || REQ_AUTH_TYPES[0],
		);

		if (basicAuth) {
			this._basicAuth.set(JSON.parse(basicAuth));
		}

		if (apiKeyAuth) {
			this._apiKeyAuth.set(JSON.parse(apiKeyAuth));
		}

		if (tokenAuth) {
			this._tokenAuth.set(JSON.parse(tokenAuth));
		}
	}

	public initExample(data: models.ReqExampleDTO) {
		const { id, authType, basicAuth, apiKeyAuth, tokenAuth } = data;
		this.draftId = id;
		this._authEnabled.set(true);
		this._auth.set(
			REQ_AUTH_TYPES.find((x) => x.id === authType) || REQ_AUTH_TYPES[0],
		);

		if (basicAuth) {
			this._basicAuth.set(JSON.parse(basicAuth));
		}

		if (apiKeyAuth) {
			this._apiKeyAuth.set(JSON.parse(apiKeyAuth));
		}

		if (tokenAuth) {
			this._tokenAuth.set(JSON.parse(tokenAuth));
		}
	}

	public requestAuthData(): models.GurlAuth {
		return {
			authEnabled: this._authEnabled(),
			authType: this._auth().id,
			basicAuth: this._basicAuth(),
			apiKeyAuth: this._apiKeyAuth(),
			tokenAuth: this._tokenAuth(),
		} as models.GurlAuth;
	}

	private _auth = signal<DropDownItem<RequestAuthType>>(REQ_AUTH_TYPES[0]);
	public activeAuth = computed(() => this._auth());

	private _authEnabled = signal<boolean>(false);
	public authEnabled = computed(() => this._authEnabled());

	public _toggleAuthEnabled() {
		this._authEnabled.update((x) => {
			this.authEnabledDbSync$.next(!x);
			return !x;
		});
	}

	private _basicAuth = signal<BasicAuth>({
		username: "",
		password: "",
	});

	public basicAuth = computed(() => this._basicAuth());

	private _basicAuthRawMode = signal<boolean>(false);

	public basicAuthRawMode = computed(() => this._basicAuthRawMode());

	public rawBasicAuthText = computed(() => {
		const ba = this._basicAuth();
		if (ba.username === "" && ba.password === "") {
			return "";
		}

		return `Basic ${btoa(`${ba.username}:${ba.password}`)}`;
	});

	public toggleBasicAuthRawMode() {
		this._basicAuthRawMode.update((x) => !x);
	}

	public _updateBasicAuth(prop: keyof BasicAuth, v: string) {
		this._basicAuth.update((prev) => {
			const updated = { ...prev, [prop]: v };
			this.basicDbSync$.next(updated);
			return updated;
		});
	}

	public _setAuth(v: RequestAuthType) {
		const itemIndex = REQ_AUTH_TYPES.findIndex((x) => x.id === v);
		if (itemIndex > -1) {
			this._auth.set(REQ_AUTH_TYPES[itemIndex]);
			this.authTypeDbSync$.next(v);
		}
	}

	private _apiKeyAuth = signal<ApiKeyAuth>({
		key: "",
		value: "",
		location: API_KEY_LOCATION[0].id,
	});

	public apiKey = computed(() => this._apiKeyAuth());

	public _updateApiKey(prop: keyof ApiKeyAuth, value: string) {
		this._apiKeyAuth.update((prev) => {
			const updated = { ...prev, [prop]: value };
			this.apiKeyDbSync$.next(updated);
			return updated;
		});
	}

	private _tokenAuth = signal<TokenAuth>({
		token: "",
		type: "bearer",
	});

	public tokenAuth = computed(() => this._tokenAuth());

	public _updateTokenAuth(prop: keyof TokenAuth, value: string) {
		this._tokenAuth.update((prev) => {
			const updated = { ...prev, [prop]: value };
			this.tokenAuthDbSync$.next(updated);
			return updated;
		});
	}

	constructor(destroyRef: DestroyRef) {
		this.destroyRef = destroyRef;

		this.authTypeDbSync$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: (v) => {
				this.reqRepo
					.updatereqDraftFields(this.draftId, {
						authType: v,
					})
					.then(() => {
						console.log(
							`auth type ${v} to be updated for draft ${this.draftId}`,
						);
					});
			},
		});

		this.basicDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					this.reqRepo
						.updatereqDraftFields(this.draftId, {
							basicAuthJson: JSON.stringify(v),
						})
						.then(() => {
							console.log(
								`basic auth ${JSON.stringify(v, null, 2)}  updated for draft ${this.draftId}`,
							);
						});
				},
			});

		this.tokenAuthDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					this.reqRepo
						.updatereqDraftFields(this.draftId, {
							tokenAuthJson: JSON.stringify(v),
						})
						.then(() => {
							console.log(
								`token auth ${JSON.stringify(v, null, 2)} updated for draft ${this.draftId}`,
							);
						});
				},
			});

		this.apiKeyDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					this.reqRepo
						.updatereqDraftFields(this.draftId, {
							apiKeyAuthJson: JSON.stringify(v),
						})
						.then(() => {
							console.log(
								`api key ${JSON.stringify(v, null, 2)} updated for draft ${this.draftId}`,
							);
						});
				},
			});

		this.authEnabledDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe({
				next: (v) => {
					this.reqRepo
						.updatereqDraftFields(this.draftId, {
							authEnabled: v,
						})
						.then(() => {
							console.log(
								`auth enabled ${v} updated for draft ${this.draftId}`,
							);
						});
				},
			});
	}
}
