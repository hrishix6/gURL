export namespace models {
	
	export class AddDraftFromRequestDTO {
	    id: string;
	    requestId: string;
	
	    static createFrom(source: any = {}) {
	        return new AddDraftFromRequestDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.requestId = source["requestId"];
	    }
	}
	export class AddEnvironmentDTO {
	    id: string;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new AddEnvironmentDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	    }
	}
	export class AddEnvironmentDraftDTO {
	    draftId: string;
	    envId: string;
	
	    static createFrom(source: any = {}) {
	        return new AddEnvironmentDraftDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.draftId = source["draftId"];
	        this.envId = source["envId"];
	    }
	}
	export class AddFreshDraftDTO {
	    id: string;
	
	    static createFrom(source: any = {}) {
	        return new AddFreshDraftDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	    }
	}
	export class ApiKeyAuth {
	    key: string;
	    value: string;
	    location: string;
	
	    static createFrom(source: any = {}) {
	        return new ApiKeyAuth(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.value = source["value"];
	        this.location = source["location"];
	    }
	}
	export class BasicAuth {
	    username: string;
	    password: string;
	
	    static createFrom(source: any = {}) {
	        return new BasicAuth(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.username = source["username"];
	        this.password = source["password"];
	    }
	}
	export class CollectionDTO {
	    id: string;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new CollectionDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	    }
	}
	export class CopyEnvironmentDTO {
	    id: string;
	    envId: string;
	
	    static createFrom(source: any = {}) {
	        return new CopyEnvironmentDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.envId = source["envId"];
	    }
	}
	export class EnvironmentDTO {
	    id: string;
	    name: string;
	    dataJSON: string;
	
	    static createFrom(source: any = {}) {
	        return new EnvironmentDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.dataJSON = source["dataJSON"];
	    }
	}
	export class EnvironmentDraftDTO {
	    id: string;
	    name: string;
	    dataJSON: string;
	    parentEnvId: string;
	    parentEnvName: string;
	
	    static createFrom(source: any = {}) {
	        return new EnvironmentDraftDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.dataJSON = source["dataJSON"];
	        this.parentEnvId = source["parentEnvId"];
	        this.parentEnvName = source["parentEnvName"];
	    }
	}
	export class FileStats {
	    name: string;
	    size: number;
	    path: string;
	
	    static createFrom(source: any = {}) {
	        return new FileStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.size = source["size"];
	        this.path = source["path"];
	    }
	}
	export class TokenAuth {
	    type: string;
	    token: string;
	
	    static createFrom(source: any = {}) {
	        return new TokenAuth(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.token = source["token"];
	    }
	}
	export class GurlAuth {
	    authEnabled: boolean;
	    authType: string;
	    basicAuth: BasicAuth;
	    apiKeyAuth: ApiKeyAuth;
	    tokenAuth: TokenAuth;
	
	    static createFrom(source: any = {}) {
	        return new GurlAuth(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.authEnabled = source["authEnabled"];
	        this.authType = source["authType"];
	        this.basicAuth = this.convertValues(source["basicAuth"], BasicAuth);
	        this.apiKeyAuth = this.convertValues(source["apiKeyAuth"], ApiKeyAuth);
	        this.tokenAuth = this.convertValues(source["tokenAuth"], TokenAuth);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class GurlKeyValItem {
	    id: string;
	    key: string;
	    val: string;
	    enabled: string;
	
	    static createFrom(source: any = {}) {
	        return new GurlKeyValItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.key = source["key"];
	        this.val = source["val"];
	        this.enabled = source["enabled"];
	    }
	}
	export class GurlKeyValMultiPartItem {
	    id: string;
	    key: string;
	    value: string;
	    enabled: string;
	    isFile: boolean;
	
	    static createFrom(source: any = {}) {
	        return new GurlKeyValMultiPartItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.key = source["key"];
	        this.value = source["value"];
	        this.enabled = source["enabled"];
	        this.isFile = source["isFile"];
	    }
	}
	export class GurlRenderMeta {
	    html5Element: string;
	    src: string;
	    canRender: boolean;
	    filepath: string;
	    detectedMimeType: string;
	    reportedMimeType: string;
	    extension: string;
	
	    static createFrom(source: any = {}) {
	        return new GurlRenderMeta(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.html5Element = source["html5Element"];
	        this.src = source["src"];
	        this.canRender = source["canRender"];
	        this.filepath = source["filepath"];
	        this.detectedMimeType = source["detectedMimeType"];
	        this.reportedMimeType = source["reportedMimeType"];
	        this.extension = source["extension"];
	    }
	}
	export class GurlReq {
	    id: string;
	    method: string;
	    url: string;
	    bodyType: string;
	    query: GurlKeyValItem[];
	    headers: GurlKeyValItem[];
	    cookies: GurlKeyValItem[];
	    urlencoded: GurlKeyValItem[];
	    multipart: GurlKeyValMultiPartItem[];
	    plaintext: string;
	    binary: string;
	    auth: GurlAuth;
	
	    static createFrom(source: any = {}) {
	        return new GurlReq(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.method = source["method"];
	        this.url = source["url"];
	        this.bodyType = source["bodyType"];
	        this.query = this.convertValues(source["query"], GurlKeyValItem);
	        this.headers = this.convertValues(source["headers"], GurlKeyValItem);
	        this.cookies = this.convertValues(source["cookies"], GurlKeyValItem);
	        this.urlencoded = this.convertValues(source["urlencoded"], GurlKeyValItem);
	        this.multipart = this.convertValues(source["multipart"], GurlKeyValMultiPartItem);
	        this.plaintext = source["plaintext"];
	        this.binary = source["binary"];
	        this.auth = this.convertValues(source["auth"], GurlAuth);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class GurlResCookie {
	    name: string;
	    value: string;
	    path: string;
	    domain: string;
	    expires: string;
	    maxAge: number;
	    secure: boolean;
	    httpOnly: boolean;
	    sameSite: number;
	    raw: string;
	
	    static createFrom(source: any = {}) {
	        return new GurlResCookie(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.value = source["value"];
	        this.path = source["path"];
	        this.domain = source["domain"];
	        this.expires = source["expires"];
	        this.maxAge = source["maxAge"];
	        this.secure = source["secure"];
	        this.httpOnly = source["httpOnly"];
	        this.sameSite = source["sameSite"];
	        this.raw = source["raw"];
	    }
	}
	export class GurlRes {
	    id: string;
	    status: number;
	    statusText: string;
	    success: boolean;
	    reqHeaders: GurlKeyValItem[];
	    resHeaders: GurlKeyValItem[];
	    body?: GurlRenderMeta;
	    cookies: GurlResCookie[];
	    size: number;
	    uploadSize: number;
	    time: number;
	    ttfbMs: number;
	    dlMs: number;
	    limitExceeded: boolean;
	    reportedSize: number;
	    sizeNotReported: boolean;
	
	    static createFrom(source: any = {}) {
	        return new GurlRes(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.status = source["status"];
	        this.statusText = source["statusText"];
	        this.success = source["success"];
	        this.reqHeaders = this.convertValues(source["reqHeaders"], GurlKeyValItem);
	        this.resHeaders = this.convertValues(source["resHeaders"], GurlKeyValItem);
	        this.body = this.convertValues(source["body"], GurlRenderMeta);
	        this.cookies = this.convertValues(source["cookies"], GurlResCookie);
	        this.size = source["size"];
	        this.uploadSize = source["uploadSize"];
	        this.time = source["time"];
	        this.ttfbMs = source["ttfbMs"];
	        this.dlMs = source["dlMs"];
	        this.limitExceeded = source["limitExceeded"];
	        this.reportedSize = source["reportedSize"];
	        this.sizeNotReported = source["sizeNotReported"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class ReqExampleDTO {
	    url: string;
	    method: string;
	    query: string;
	    path: string;
	    headers: string;
	    cookies: string;
	    bodyType: string;
	    multipart: string;
	    urlencoded: string;
	    text: string;
	    binary: string;
	    authEnabled: boolean;
	    authType: string;
	    basicAuth: string;
	    apiKeyAuth: string;
	    tokenAuth: string;
	    id: string;
	    requestId: string;
	    collectionId: string;
	    name: string;
	    uploadSize: number;
	    responseSuccess: boolean;
	    responseStatus: number;
	    responseStatusText: string;
	    responseTimeMS: number;
	    sentHeaders: string;
	    responseHeaders: string;
	    responseCookies: string;
	    responseBody: string;
	    responseSize: number;
	    limitExceeded: boolean;
	    responseTffbMs: number;
	    responseDlMs: number;
	
	    static createFrom(source: any = {}) {
	        return new ReqExampleDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.url = source["url"];
	        this.method = source["method"];
	        this.query = source["query"];
	        this.path = source["path"];
	        this.headers = source["headers"];
	        this.cookies = source["cookies"];
	        this.bodyType = source["bodyType"];
	        this.multipart = source["multipart"];
	        this.urlencoded = source["urlencoded"];
	        this.text = source["text"];
	        this.binary = source["binary"];
	        this.authEnabled = source["authEnabled"];
	        this.authType = source["authType"];
	        this.basicAuth = source["basicAuth"];
	        this.apiKeyAuth = source["apiKeyAuth"];
	        this.tokenAuth = source["tokenAuth"];
	        this.id = source["id"];
	        this.requestId = source["requestId"];
	        this.collectionId = source["collectionId"];
	        this.name = source["name"];
	        this.uploadSize = source["uploadSize"];
	        this.responseSuccess = source["responseSuccess"];
	        this.responseStatus = source["responseStatus"];
	        this.responseStatusText = source["responseStatusText"];
	        this.responseTimeMS = source["responseTimeMS"];
	        this.sentHeaders = source["sentHeaders"];
	        this.responseHeaders = source["responseHeaders"];
	        this.responseCookies = source["responseCookies"];
	        this.responseBody = source["responseBody"];
	        this.responseSize = source["responseSize"];
	        this.limitExceeded = source["limitExceeded"];
	        this.responseTffbMs = source["responseTffbMs"];
	        this.responseDlMs = source["responseDlMs"];
	    }
	}
	export class ReqExampleLightDTO {
	    id: string;
	    requestId: string;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new ReqExampleLightDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.requestId = source["requestId"];
	        this.name = source["name"];
	    }
	}
	export class RequestDraftDTO {
	    url: string;
	    method: string;
	    query: string;
	    path: string;
	    headers: string;
	    cookies: string;
	    bodyType: string;
	    multipart: string;
	    urlencoded: string;
	    text: string;
	    binary: string;
	    authEnabled: boolean;
	    authType: string;
	    basicAuth: string;
	    apiKeyAuth: string;
	    tokenAuth: string;
	    id: string;
	    parentRequestId: string;
	    parentRequestName: string;
	    parentCollectionId: string;
	
	    static createFrom(source: any = {}) {
	        return new RequestDraftDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.url = source["url"];
	        this.method = source["method"];
	        this.query = source["query"];
	        this.path = source["path"];
	        this.headers = source["headers"];
	        this.cookies = source["cookies"];
	        this.bodyType = source["bodyType"];
	        this.multipart = source["multipart"];
	        this.urlencoded = source["urlencoded"];
	        this.text = source["text"];
	        this.binary = source["binary"];
	        this.authEnabled = source["authEnabled"];
	        this.authType = source["authType"];
	        this.basicAuth = source["basicAuth"];
	        this.apiKeyAuth = source["apiKeyAuth"];
	        this.tokenAuth = source["tokenAuth"];
	        this.id = source["id"];
	        this.parentRequestId = source["parentRequestId"];
	        this.parentRequestName = source["parentRequestName"];
	        this.parentCollectionId = source["parentCollectionId"];
	    }
	}
	export class RequestLightDTO {
	    id: string;
	    name: string;
	    method: string;
	    url: string;
	    collectionId: string;
	
	    static createFrom(source: any = {}) {
	        return new RequestLightDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.method = source["method"];
	        this.url = source["url"];
	        this.collectionId = source["collectionId"];
	    }
	}
	export class SaveDraftAsReqDTO {
	    draftId: string;
	    requestId: string;
	    collectionId: string;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new SaveDraftAsReqDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.draftId = source["draftId"];
	        this.requestId = source["requestId"];
	        this.collectionId = source["collectionId"];
	        this.name = source["name"];
	    }
	}
	export class SaveEnvDraftAsEnvDTO {
	    draftId: string;
	    envId: string;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new SaveEnvDraftAsEnvDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.draftId = source["draftId"];
	        this.envId = source["envId"];
	        this.name = source["name"];
	    }
	}
	export class SaveRequestCopyDTO {
	    sourceId: string;
	    id: string;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new SaveRequestCopyDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sourceId = source["sourceId"];
	        this.id = source["id"];
	        this.name = source["name"];
	    }
	}
	export class SavedResponseRenderMeta {
	    html5Element: string;
	    src: string;
	    canRender: boolean;
	    filepath: string;
	    extension: string;
	
	    static createFrom(source: any = {}) {
	        return new SavedResponseRenderMeta(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.html5Element = source["html5Element"];
	        this.src = source["src"];
	        this.canRender = source["canRender"];
	        this.filepath = source["filepath"];
	        this.extension = source["extension"];
	    }
	}
	
	export class UIStateDTO {
	    openTabsJson: string;
	    layout: string;
	    activeTab: string;
	    isSidebarOpen: boolean;
	    alwaysDiscardDrafts: boolean;
	    alwaysDiscardEnvDrafts: boolean;
	
	    static createFrom(source: any = {}) {
	        return new UIStateDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.openTabsJson = source["openTabsJson"];
	        this.layout = source["layout"];
	        this.activeTab = source["activeTab"];
	        this.isSidebarOpen = source["isSidebarOpen"];
	        this.alwaysDiscardDrafts = source["alwaysDiscardDrafts"];
	        this.alwaysDiscardEnvDrafts = source["alwaysDiscardEnvDrafts"];
	    }
	}
	export class UpdateDraftFieldsDTO {
	    draftId: string;
	    url?: string;
	    method?: string;
	    queryJson?: string;
	    pathJson?: string;
	    headersJson?: string;
	    cookiesJson?: string;
	    bodyType?: string;
	    text?: string;
	    binaryJson?: string;
	    multipartJson?: string;
	    urlencodedJson?: string;
	    authType?: string;
	    authEnabled?: boolean;
	    basicAuthJson?: string;
	    apiKeyAuthJson?: string;
	    tokenAuthJson?: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateDraftFieldsDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.draftId = source["draftId"];
	        this.url = source["url"];
	        this.method = source["method"];
	        this.queryJson = source["queryJson"];
	        this.pathJson = source["pathJson"];
	        this.headersJson = source["headersJson"];
	        this.cookiesJson = source["cookiesJson"];
	        this.bodyType = source["bodyType"];
	        this.text = source["text"];
	        this.binaryJson = source["binaryJson"];
	        this.multipartJson = source["multipartJson"];
	        this.urlencodedJson = source["urlencodedJson"];
	        this.authType = source["authType"];
	        this.authEnabled = source["authEnabled"];
	        this.basicAuthJson = source["basicAuthJson"];
	        this.apiKeyAuthJson = source["apiKeyAuthJson"];
	        this.tokenAuthJson = source["tokenAuthJson"];
	    }
	}
	export class UpdateEnvDraftDataDTO {
	    draftId: string;
	    dataJSON: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateEnvDraftDataDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.draftId = source["draftId"];
	        this.dataJSON = source["dataJSON"];
	    }
	}
	export class UpdateUIStateDTO {
	    layout?: string;
	    openTabsJson?: string;
	    isSidebarOpen?: boolean;
	    activeTabId?: string;
	    alwaysDiscardReqDrafts?: boolean;
	    alwaysDiscardEnvDrafts?: boolean;
	
	    static createFrom(source: any = {}) {
	        return new UpdateUIStateDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.layout = source["layout"];
	        this.openTabsJson = source["openTabsJson"];
	        this.isSidebarOpen = source["isSidebarOpen"];
	        this.activeTabId = source["activeTabId"];
	        this.alwaysDiscardReqDrafts = source["alwaysDiscardReqDrafts"];
	        this.alwaysDiscardEnvDrafts = source["alwaysDiscardEnvDrafts"];
	    }
	}

}

