import { computed, Injectable, signal } from '@angular/core';
import { nanoid } from 'nanoid';
import { CancelReq, SendReq } from '../../wailsjs/go/main/Gurl';
import { main } from '../../wailsjs/go/models';
import {
  KeyValItem,
  MultipartItem,
  ReqBodyType,
  ReqTabId,
  RequestHeaders,
  RequestMethod,
  RequestQuery,
  ResStatsType,
  ResTabId,
} from '../app/models';
import { DropDownItem } from '../common/components/dropdown/types';
import {
  HID_PLACEHOLDER,
  MULTIPART_ID_PLACEHOLDER,
  QID_PLACEHOLDER,
  REQ_BODY_TYPES,
  REQ_DETAILS_TABS,
  REQ_METHODS,
  RES_DETAILS_TABS,
  URLENCODED_ID_PLACEHOLDER,
} from '../constants';

@Injectable()
export class FormService {
  //#region tab-management
  private _activeRequestTab = signal<ReqTabId>('req_query');
  private _activeResTab = signal<ResTabId>('res_body');
  public activeReqTab = computed(() => this._activeRequestTab());
  public activeResTab = computed(() => this._activeResTab());
  public setActiveReqTab(id: ReqTabId) {
    const tab = REQ_DETAILS_TABS.find((x) => x.id === id);
    if (tab) {
      this._activeRequestTab.set(id);
    }
  }
  public setActiveResTab(id: ResTabId) {
    const index = RES_DETAILS_TABS.findIndex((x) => x.id === id);
    if (index !== -1) {
      this._activeResTab.set(id);
    }
  }

  //#endregion tab-management

  //#region Headers
  private _headers = signal<RequestHeaders>([
    {
      id: HID_PLACEHOLDER,
      key: '',
      val: '',
      enabled: 'on',
    },
  ]);
  public headers = computed(() => this._headers());
  public headerCount = computed(() => this._headers.length);
  private _resHeaders = signal<main.GurlKeyValItem[]>([]);
  public resHeaders = computed(() => this._resHeaders());

  public addHeader() {
    this._headers.update((prev) => {
      const placeholderItemIndex = prev.findIndex((x) => x.id === HID_PLACEHOLDER);

      if (placeholderItemIndex >= 0) {
        return prev;
      }

      return [
        ...prev,
        {
          id: HID_PLACEHOLDER,
          key: '',
          val: '',
          enabled: 'on',
        },
      ];
    });
  }

  public updateHeader(id: string, prop: Exclude<keyof KeyValItem, 'id'>, v: string) {
    this._headers.update((prev) => {
      const index = prev.findIndex((x) => x.id === id);
      if (index == -1) {
        return prev;
      }

      const copy = [...prev];
      copy[index][prop] = v;

      if (id === HID_PLACEHOLDER) {
        copy[index].id = nanoid();
      }

      return copy;
    });
  }

  public deleteHeader(id: string) {
    this._headers.update((prev) => {
      return prev.filter((x) => x.id !== id);
    });
  }

  //#endregion Headers

  //#region Query

  private _queryParams = signal<RequestQuery>([
    {
      id: QID_PLACEHOLDER,
      key: '',
      val: '',
      enabled: 'on',
    },
  ]);
  public queryParams = computed(() => this._queryParams());
  public queryParamsCount = computed(() => this._queryParams.length);
  public addQueryParam() {
    this._queryParams.update((prev) => {
      const placeholderItemIndex = prev.findIndex((x) => x.id === QID_PLACEHOLDER);

      if (placeholderItemIndex >= 0) {
        return prev;
      }

      return [
        ...prev,
        {
          id: QID_PLACEHOLDER,
          key: '',
          val: '',
          enabled: 'on',
        },
      ];
    });
  }

  public updateQueryParam(id: string, prop: Exclude<keyof KeyValItem, 'id'>, v: string) {
    this._queryParams.update((prev) => {
      const index = prev.findIndex((x) => x.id === id);
      if (index == -1) {
        return prev;
      }

      const copy = [...prev];
      copy[index][prop] = v;
      if (id === QID_PLACEHOLDER) {
        copy[index].id = nanoid();
      }

      return copy;
    });
  }

  public deleteQueryParam(id: string) {
    this._queryParams.update((prev) => {
      return prev.filter((x) => x.id !== id);
    });
  }

  //#endregion Query

  //#region Url
  private _url = signal<string>('');
  public url = computed(() => this._url());
  private _isUrlValid = signal<boolean>(true);
  public isValidUrl = computed(() => this._isUrlValid());

  public setUrl(v: string) {
    this._isUrlValid.set(true);
    this._url.set(v);
  }

  public parseUrl() {
    try {
      const parsed = new URL(this._url());

      const baseUrl = `${parsed.origin}${parsed.pathname}`;
      const searchParams = parsed.searchParams;

      if (searchParams.size) {
        this.appendQueryParams(searchParams);
      }

      this.setUrl(baseUrl);
    } catch (error) {
      this._isUrlValid.set(false);
    }
  }

  private appendQueryParams(params: URLSearchParams) {
    this._queryParams.update((_) => {
      const newParams: KeyValItem[] = [];
      for (const [k, v] of params.entries()) {
        const newId = nanoid();
        newParams.push({
          id: newId,
          key: k,
          val: v,
          enabled: 'on',
        });
      }
      return [
        ...newParams,
        {
          id: QID_PLACEHOLDER,
          key: '',
          val: '',
          enabled: 'on',
        },
      ];
    });
  }

  //#endregion Url

  //#region Method
  private _method = signal<DropDownItem<RequestMethod>>(REQ_METHODS[0]);
  public method = computed(() => this._method());

  public setSelectedMethod(method: RequestMethod) {
    const itemIndex = REQ_METHODS.findIndex((x) => x.id === method);
    if (itemIndex > -1) {
      this._method.set(REQ_METHODS[itemIndex]);
    }
  }
  //#endregion Method

  //#region Body
  private _bodyType = signal<DropDownItem<ReqBodyType>>(REQ_BODY_TYPES[0]);
  public bodyType = computed(() => this._bodyType());
  public setBodyType(v: ReqBodyType) {
    const itemIndex = REQ_BODY_TYPES.findIndex((x) => x.id === v);
    if (itemIndex > -1) {
      this._bodyType.set(REQ_BODY_TYPES[itemIndex]);
    }
  }
  //#region Multipart
  private _multiPartForm = signal<MultipartItem[]>([
    {
      id: MULTIPART_ID_PLACEHOLDER,
      key: '',
      val: '',
      enabled: 'on',
    },
  ]);
  public multipartForm = computed(() => this._multiPartForm());

  public addMultiPartField() {
    this._multiPartForm.update((prev) => {
      const placeholderItemIndex = prev.findIndex((x) => x.id === MULTIPART_ID_PLACEHOLDER);

      if (placeholderItemIndex >= 0) {
        return prev;
      }

      return [
        ...prev,
        {
          id: MULTIPART_ID_PLACEHOLDER,
          key: '',
          val: '',
          enabled: 'on',
        },
      ];
    });
  }

  public updateMultiPartField(
    id: string,
    prop: Exclude<keyof MultipartItem, 'id' | 'val'>,
    v: string
  ) {
    this._multiPartForm.update((prev) => {
      const index = prev.findIndex((x) => x.id === id);
      if (index == -1) {
        return prev;
      }

      const copy = [...prev];
      copy[index][prop] = v;

      if (id === MULTIPART_ID_PLACEHOLDER) {
        copy[index].id = nanoid();
      }

      return copy;
    });
  }

  public clearMultipartFileInput(id: string) {
    this._multiPartForm.update((prev) => {
      const index = prev.findIndex((x) => x.id === id);
      if (index == -1) {
        return prev;
      }

      const copy = [...prev];
      copy[index].val = '';
      return copy;
    });
  }

  public updateMultipartFieldValue(id: string, v: string | main.FileStats) {
    this._multiPartForm.update((prev) => {
      const index = prev.findIndex((x) => x.id === id);
      if (index == -1) {
        return prev;
      }

      const copy = [...prev];
      copy[index].val = v;

      if (id === MULTIPART_ID_PLACEHOLDER) {
        copy[index].id = nanoid();
      }

      return copy;
    });
  }

  public deleteMultipartItem(id: string) {
    this._multiPartForm.update((prev) => {
      return prev.filter((x) => x.id !== id);
    });
  }
  //#endregion Multipart

  //#region UrlEncoded
  private _urlEncodedParams = signal<KeyValItem[]>([
    {
      id: URLENCODED_ID_PLACEHOLDER,
      key: '',
      val: '',
      enabled: 'on',
    },
  ]);
  public urlEncodedParams = computed(() => this._urlEncodedParams());

  public addUrlEncodedField() {
    this._urlEncodedParams.update((prev) => {
      const placeholderItemIndex = prev.findIndex((x) => x.id === URLENCODED_ID_PLACEHOLDER);

      if (placeholderItemIndex >= 0) {
        return prev;
      }

      return [
        ...prev,
        {
          id: URLENCODED_ID_PLACEHOLDER,
          key: '',
          val: '',
          enabled: 'on',
        },
      ];
    });
  }

  public updateUrlEncodedField(id: string, prop: Exclude<keyof KeyValItem, 'id'>, v: string) {
    this._urlEncodedParams.update((prev) => {
      const index = prev.findIndex((x) => x.id === id);
      if (index == -1) {
        return prev;
      }

      const copy = [...prev];
      copy[index][prop] = v;

      if (id === URLENCODED_ID_PLACEHOLDER) {
        copy[index].id = nanoid();
      }

      return copy;
    });
  }

  public deleteUrlEncodedField(id: string) {
    this._urlEncodedParams.update((prev) => {
      return prev.filter((x) => x.id !== id);
    });
  }

  //#endregion UrlEncoded

  //#region Binary
  private _binaryBody = signal<main.FileStats | null>(null);
  public binaryBody = computed(() => this._binaryBody());

  public setBinaryBody(v: main.FileStats) {
    this._binaryBody.set(v);
  }

  public clearBinaryBody() {
    this._binaryBody.set(null);
  }

  //#endregion Binary

  //#region Text
  private _textBody = signal<string>('');
  public textBody = computed(() => this._textBody());
  public setTextBody(v: string) {
    this._textBody.set(v);
  }
  //#endregion Text

  //#endregion Body

  //#region Request-Response
  private _requestId = signal<string>('');
  private _isReqInProgress = signal<boolean>(false);
  public isReqInProgress = computed(() => this._isReqInProgress());
  private _isReqAborted = signal<boolean>(false);
  public isReqAborted = computed(() => this._isReqAborted());
  private _resStats = signal<ResStatsType>(null);
  public resStats = computed(() => this._resStats());
  public before() {
    this._isReqInProgress.set(true);
    this._resHeaders.set([]);
    this._resStats.set(null);
    this._isReqAborted.set(false);
  }

  public async send() {
    if (!this.isValidUrl()) {
      console.log(`invalid URL`);
      return;
    }

    try {
      this.before();
      const newReqId = nanoid();
      this._requestId.set(newReqId);
      const payload: Partial<main.GurlReq> = {
        id: newReqId,
        method: this.method().id,
        headers: [],
        bodyType: this.bodyType().id,
        binary: '',
        multipart: [],
        plaintext: '',
        urlencoded: [],
      };

      //query
      const params = new URLSearchParams(
        this.queryParams().reduce((prev, curr) => {
          if (curr.key && curr.key !== QID_PLACEHOLDER && curr.enabled == 'on') {
            prev[curr.key] = curr.val;
          }
          return prev;
        }, {} as Record<string, string>)
      );

      const endpointURL = params.size ? `${this.url()}?${params.toString()}` : this.url();

      payload.url = endpointURL;

      //headers
      for (const h of this.headers()) {
        if (h.key && h.key !== HID_PLACEHOLDER && h.enabled === 'on') {
          payload.headers!.push({ key: h.key, value: h.val });
        }
      }

      switch (this.bodyType().id) {
        case 'json':
        case 'plaintext':
        case 'xml': {
          payload.plaintext = this.textBody();
          break;
        }
        case 'multipart': {
          for (const field of this.multipartForm()) {
            if (field.key && field.key !== MULTIPART_ID_PLACEHOLDER && field.enabled === 'on') {
              if (typeof field.val === 'string') {
                payload.multipart!.push({
                  key: field.key,
                  isFile: false,
                  value: field.val,
                });
              } else {
                payload.multipart!.push({
                  key: field.key,
                  isFile: true,
                  value: field.val.path,
                });
              }
            }
          }
          break;
        }
        case 'urlencoded': {
          for (const field of this.urlEncodedParams()) {
            if (field.key && field.key !== URLENCODED_ID_PLACEHOLDER && field.enabled) {
              payload.urlencoded!.push({
                key: field.key,
                value: field.val,
              });
            }
          }
          break;
        }
        case 'binary': {
          const binaryB = this.binaryBody();
          if (binaryB) {
            payload.binary = binaryB.path;
          }
          break;
        }

        default: {
          break;
        }
      }

      console.log(`url: ${payload.url}`);

      const res = await SendReq(payload as main.GurlReq);

      this._isReqInProgress.set(false);

      if (res.success) {
        console.log(res.body);
      }

      this._resHeaders.set(res.headers);
      this._resStats.set({
        size: res.size,
        status: res.status,
        statusText: res.statusText,
        success: res.success,
        time: res.time,
      });
    } catch (error) {
      console.error(error);
    }
  }

  public async cancel() {
    try {
      await CancelReq(this._requestId());
      this._isReqInProgress.set(false);
      this._isReqAborted.set(true);
    } catch (error) {
      console.error(error);
    }
  }
  //#endregion Request-Response
}
