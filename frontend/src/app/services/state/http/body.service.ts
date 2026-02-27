import { computed, type DestroyRef, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import type { models } from "@wailsjs/go/models";
import { nanoid } from "nanoid";
import { debounceTime, Subject } from "rxjs";
import {
	MULTIPART_ID_PLACEHOLDER,
	REQ_BODY_TYPES,
	URLENCODED_ID_PLACEHOLDER,
} from "@/constants";
import { getReqRepository } from "@/services";
import type { DropDownItem, MultipartItem, ReqBodyType } from "@/types";

export class BodyService {
	private draftId = "";
	private destroyRef: DestroyRef;
	private bodyTypeDbSync$ = new Subject<ReqBodyType>();
	private reqRepo = getReqRepository();
	private multipartDbSync$ = new Subject<MultipartItem[]>();
	private urlEncodedDbSync$ = new Subject<models.GurlKeyValItem[]>();
	private binaryBDbSync$ = new Subject<models.FileStats | null>();
	private textBDbSync$ = new Subject<string>();

	public init(draft: models.RequestDraftDTO) {
		const { bodyType, multipart, urlencoded, binary, text } = draft;
		this.draftId = draft.id;

		this._bodyType.set(
			REQ_BODY_TYPES.find((x) => x.id === bodyType) || REQ_BODY_TYPES[0],
		);
		this._textBody.set(text);
		this._urlEncodedParams.set([
			...JSON.parse(urlencoded),
			{
				id: URLENCODED_ID_PLACEHOLDER,
				key: "",
				val: "",
				enabled: "on",
			},
		]);
		this._multiPartForm.set([
			...JSON.parse(multipart),
			{
				id: MULTIPART_ID_PLACEHOLDER,
				key: "",
				val: "",
				enabled: "on",
			},
		]);
		this._binaryBody.set(binary ? JSON.parse(binary) : null);
	}

	public initExample(data: models.ReqExampleDTO) {
		const { bodyType, multipart, urlencoded, binary, text } = data;
		this.draftId = data.id;

		this._bodyType.set(
			REQ_BODY_TYPES.find((x) => x.id === bodyType) || REQ_BODY_TYPES[0],
		);

		this._textBody.set(text);

		this._urlEncodedParams.set([...JSON.parse(urlencoded)]);
		this._multiPartForm.set([...JSON.parse(multipart)]);
		this._binaryBody.set(binary ? JSON.parse(binary) : null);
	}

	//#region Body
	private _bodyType = signal<DropDownItem<ReqBodyType>>(REQ_BODY_TYPES[0]);
	public bodyType = computed(() => this._bodyType());
	public _setBodyType(v: ReqBodyType) {
		const itemIndex = REQ_BODY_TYPES.findIndex((x) => x.id === v);
		if (itemIndex > -1) {
			this._bodyType.set(REQ_BODY_TYPES[itemIndex]);
			this.bodyTypeDbSync$.next(v);
		}
	}

	//#region Multipart
	private _multiPartForm = signal<MultipartItem[]>([
		{
			id: MULTIPART_ID_PLACEHOLDER,
			key: "",
			val: "",
			enabled: "on",
		},
	]);
	public multipartForm = computed(() => this._multiPartForm());

	public addMultiPartField() {
		this._multiPartForm.update((prev) => {
			const placeholderItemIndex = prev.findIndex(
				(x) => x.id === MULTIPART_ID_PLACEHOLDER,
			);

			if (placeholderItemIndex >= 0) {
				return prev;
			}

			return [
				...prev,
				{
					id: MULTIPART_ID_PLACEHOLDER,
					key: "",
					val: "",
					enabled: "on",
				},
			];
		});
	}

	public _updateMultiPartField(
		id: string,
		prop: Exclude<keyof MultipartItem, "id" | "val">,
		v: string,
	) {
		this._multiPartForm.update((prev) => {
			const index = prev.findIndex((x) => x.id === id);
			if (index === -1) {
				return prev;
			}

			const copy = [...prev];
			copy[index][prop] = v;

			if (id === MULTIPART_ID_PLACEHOLDER) {
				copy[index].id = nanoid();
			}

			this.multipartDbSync$.next(copy);
			return copy;
		});
	}

	public _clearMultipartFileInput(id: string) {
		this._multiPartForm.update((prev) => {
			const index = prev.findIndex((x) => x.id === id);
			if (index === -1) {
				return prev;
			}

			const copy = [...prev];
			copy[index].val = "";

			this.multipartDbSync$.next(copy);
			return copy;
		});
	}

	public _updateMultipartFieldValue(id: string, v: string | models.FileStats) {
		this._multiPartForm.update((prev) => {
			const index = prev.findIndex((x) => x.id === id);
			if (index === -1) {
				return prev;
			}

			const copy = [...prev];
			copy[index].val = v;

			if (id === MULTIPART_ID_PLACEHOLDER) {
				copy[index].id = nanoid();
			}

			this.multipartDbSync$.next(copy);
			return copy;
		});
	}

	public _deleteMultipartItem(id: string) {
		this._multiPartForm.update((prev) => {
			const copy = prev.filter((x) => x.id !== id);
			this.multipartDbSync$.next(copy);
			return copy;
		});
	}

	public multipartFormForExample() {
		return this._multiPartForm().filter(
			(x) => x.id !== MULTIPART_ID_PLACEHOLDER,
		);
	}

	public requestMultipartData() {
		return this._multiPartForm().reduce((prev, curr) => {
			if (curr.id !== MULTIPART_ID_PLACEHOLDER) {
				if (typeof curr.val === "string") {
					prev.push({
						id: curr.id,
						key: curr.key,
						value: curr.val,
						isFile: false,
						enabled: curr.enabled,
					});
				} else {
					prev.push({
						id: curr.id,
						key: curr.key,
						isFile: true,
						value: curr.val.path,
						enabled: curr.enabled,
					});
				}
			}
			return prev;
		}, [] as models.GurlKeyValMultiPartItem[]);
	}

	public multiPartItemsForHistory() {
		return this._multiPartForm().filter(
			(x) => x.id !== MULTIPART_ID_PLACEHOLDER,
		);
	}

	//#endregion Multipart

	//#region UrlEncoded

	private _bulkEditModeUrlEncodedForm = signal<boolean>(false);

	public bulkEditModeUrlEncodedForm = computed(() =>
		this._bulkEditModeUrlEncodedForm(),
	);

	public toggleEditModeUrlEncodedForm() {
		this._bulkEditModeUrlEncodedForm.update((x) => !x);
	}

	private _bulkUrlEncodedFormText = signal<string>("");

	public setBulkUrlEncodedFormText(s: string) {
		this._bulkUrlEncodedFormText.set(s);
	}

	public bulkUrlEncodedFormText = computed(() => {
		return this._urlEncodedParams().reduce((prev, curr) => {
			if (curr.id !== URLENCODED_ID_PLACEHOLDER) {
				prev += `${curr.enabled === "on" ? "" : "#"}${curr.key}:${curr.val}\n`;
			}
			return prev;
		}, "");
	});

	public _bulkUpdateUrlEncodedForm(items: models.GurlKeyValItem[]) {
		const newParams = [
			...items,
			{
				id: URLENCODED_ID_PLACEHOLDER,
				key: "",
				val: "",
				enabled: "on",
			},
		];
		this._urlEncodedParams.set(newParams);
		this.urlEncodedDbSync$.next(newParams);
	}

	private _urlEncodedParams = signal<models.GurlKeyValItem[]>([
		{
			id: URLENCODED_ID_PLACEHOLDER,
			key: "",
			val: "",
			enabled: "on",
		},
	]);
	public urlEncodedParams = computed(() => this._urlEncodedParams());

	public addUrlEncodedField() {
		this._urlEncodedParams.update((prev) => {
			const placeholderItemIndex = prev.findIndex(
				(x) => x.id === URLENCODED_ID_PLACEHOLDER,
			);

			if (placeholderItemIndex >= 0) {
				return prev;
			}

			return [
				...prev,
				{
					id: URLENCODED_ID_PLACEHOLDER,
					key: "",
					val: "",
					enabled: "on",
				},
			];
		});
	}

	public _updateUrlEncodedField(
		id: string,
		prop: Exclude<keyof models.GurlKeyValItem, "id">,
		v: string,
	) {
		this._urlEncodedParams.update((prev) => {
			const index = prev.findIndex((x) => x.id === id);
			if (index === -1) {
				return prev;
			}

			const copy = [...prev];
			copy[index][prop] = v;

			if (id === URLENCODED_ID_PLACEHOLDER) {
				copy[index].id = nanoid();
			}

			this.urlEncodedDbSync$.next(copy);

			return copy;
		});
	}

	public _deleteUrlEncodedField(id: string) {
		this._urlEncodedParams.update((prev) => {
			const copy = prev.filter((x) => x.id !== id);
			this.urlEncodedDbSync$.next(copy);
			return copy;
		});
	}

	public urlEncodedParamsForExample() {
		return this._urlEncodedParams().filter(
			(x) => x.id !== URLENCODED_ID_PLACEHOLDER,
		);
	}

	public requestUrlEncodedData() {
		return this._urlEncodedParams().filter(
			(x) => x.id !== URLENCODED_ID_PLACEHOLDER,
		);
	}

	//#endregion UrlEncoded

	//#region Binary
	private _binaryBody = signal<models.FileStats | null>(null);
	public binaryBody = computed(() => this._binaryBody());

	public _setBinaryBody(v: models.FileStats) {
		this._binaryBody.set(v);
		this.binaryBDbSync$.next(v);
	}

	public _clearBinaryBody() {
		this._binaryBody.set(null);
		this.binaryBDbSync$.next(null);
	}

	public requestBinaryData() {
		return this._binaryBody()?.path || "";
	}

	//#endregion Binary

	//#region Text
	private _textBody = signal<string>("");
	public textBody = computed(() => this._textBody());
	public _setTextBody(v: string) {
		this._textBody.set(v);
		this.textBDbSync$.next(v);
	}
	//#endregion Text

	//#endregion Body

	constructor(destroyRef: DestroyRef) {
		this.destroyRef = destroyRef;

		//body type
		this.bodyTypeDbSync$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: (v) => {
				this.reqRepo
					.updatereqDraftFields({
						draftId: this.draftId,
						bodyType: v,
					})
					.then(() => {
						console.log(`[${this.draftId}] body type set to ${v} in SQlite`);
					});
			},
		});

		//url encoded form
		this.urlEncodedDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					const payload = v.filter((x) => x.id !== URLENCODED_ID_PLACEHOLDER);
					this.reqRepo.updatereqDraftFields({
						draftId: this.draftId,
						urlencodedJson: JSON.stringify(payload),
					});
				},
			});

		//multipart form
		this.multipartDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					const payload = v.filter((x) => x.id !== MULTIPART_ID_PLACEHOLDER);
					this.reqRepo
						.updatereqDraftFields({
							draftId: this.draftId,
							multipartJson: JSON.stringify(payload),
						})
						.then(() => {
							console.log(`[${this.draftId}] multipart form updated in SQlite`);
						});
				},
			});

		//text body
		this.textBDbSync$
			.pipe(takeUntilDestroyed(this.destroyRef), debounceTime(500))
			.subscribe({
				next: (v) => {
					this.reqRepo
						.updatereqDraftFields({
							draftId: this.draftId,
							text: v,
						})
						.then(() => {
							console.log(`[${this.draftId}] text body updated in SQlite`);
						});
				},
			});

		//binary body
		this.binaryBDbSync$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
			next: (v) => {
				this.reqRepo
					.updatereqDraftFields({
						draftId: this.draftId,
						binaryJson: v ? JSON.stringify(v) : "",
					})
					.then(() => {
						console.log(`[${this.draftId}] binary body updated in SQlite`);
					});
			},
		});
	}
}
