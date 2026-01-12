export namespace models {
	
	export class AddCollectionDTO {
	    id: string;
	    name: string;
	
	    static createFrom(source: any = {}) {
	        return new AddCollectionDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
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
	export class GurlKeyValItem {
	    key: string;
	    value: string;
	    enabled: boolean;
	
	    static createFrom(source: any = {}) {
	        return new GurlKeyValItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.value = source["value"];
	        this.enabled = source["enabled"];
	    }
	}
	export class GurlKeyValMultiPartItem {
	    key: string;
	    value: string;
	    enabled: boolean;
	    isFile: boolean;
	
	    static createFrom(source: any = {}) {
	        return new GurlKeyValMultiPartItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
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
	    reportedMileType: string;
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
	        this.reportedMileType = source["reportedMileType"];
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
	    headers: GurlKeyValItem[];
	    body?: GurlRenderMeta;
	    cookies: GurlResCookie[];
	    isFile: boolean;
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
	        this.headers = this.convertValues(source["headers"], GurlKeyValItem);
	        this.body = this.convertValues(source["body"], GurlRenderMeta);
	        this.cookies = this.convertValues(source["cookies"], GurlResCookie);
	        this.isFile = source["isFile"];
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
	
	export class RequestDTO {
	    id: string;
	    url: string;
	    name: string;
	    method: string;
	    query: string;
	    headers: string;
	    cookies: string;
	    bodyType: string;
	    multipart: string;
	    urlencoded: string;
	    text: string;
	    binary: string;
	    collectionId: string;
	
	    static createFrom(source: any = {}) {
	        return new RequestDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.url = source["url"];
	        this.name = source["name"];
	        this.method = source["method"];
	        this.query = source["query"];
	        this.headers = source["headers"];
	        this.cookies = source["cookies"];
	        this.bodyType = source["bodyType"];
	        this.multipart = source["multipart"];
	        this.urlencoded = source["urlencoded"];
	        this.text = source["text"];
	        this.binary = source["binary"];
	        this.collectionId = source["collectionId"];
	    }
	}
	export class RequestDraftDTO {
	    id: string;
	    url: string;
	    method: string;
	    query: string;
	    headers: string;
	    cookies: string;
	    bodyType: string;
	    multipart: string;
	    urlencoded: string;
	    text: string;
	    binary: string;
	    parentRequestId: string;
	    parentRequestName: string;
	    parentCollectionId: string;
	
	    static createFrom(source: any = {}) {
	        return new RequestDraftDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.url = source["url"];
	        this.method = source["method"];
	        this.query = source["query"];
	        this.headers = source["headers"];
	        this.cookies = source["cookies"];
	        this.bodyType = source["bodyType"];
	        this.multipart = source["multipart"];
	        this.urlencoded = source["urlencoded"];
	        this.text = source["text"];
	        this.binary = source["binary"];
	        this.parentRequestId = source["parentRequestId"];
	        this.parentRequestName = source["parentRequestName"];
	        this.parentCollectionId = source["parentCollectionId"];
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
	export class UIStateDTO {
	    openTabsJson: string;
	    layout: string;
	    activeTab: string;
	    isSidebarOpen: boolean;
	
	    static createFrom(source: any = {}) {
	        return new UIStateDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.openTabsJson = source["openTabsJson"];
	        this.layout = source["layout"];
	        this.activeTab = source["activeTab"];
	        this.isSidebarOpen = source["isSidebarOpen"];
	    }
	}
	export class UpdateDraftBinaryBodyDTO {
	    requestId: string;
	    binaryJson: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateDraftBinaryBodyDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.requestId = source["requestId"];
	        this.binaryJson = source["binaryJson"];
	    }
	}
	export class UpdateDraftBodyTypeDTO {
	    requestId: string;
	    bodyType: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateDraftBodyTypeDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.requestId = source["requestId"];
	        this.bodyType = source["bodyType"];
	    }
	}
	export class UpdateDraftCookiesDTO {
	    requestId: string;
	    cookiesJSON: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateDraftCookiesDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.requestId = source["requestId"];
	        this.cookiesJSON = source["cookiesJSON"];
	    }
	}
	export class UpdateDraftHeadersDTO {
	    requestId: string;
	    headersJson: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateDraftHeadersDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.requestId = source["requestId"];
	        this.headersJson = source["headersJson"];
	    }
	}
	export class UpdateDraftMethodDTO {
	    requestId: string;
	    method: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateDraftMethodDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.requestId = source["requestId"];
	        this.method = source["method"];
	    }
	}
	export class UpdateDraftMultipartFormDTO {
	    requestId: string;
	    multipartJson: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateDraftMultipartFormDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.requestId = source["requestId"];
	        this.multipartJson = source["multipartJson"];
	    }
	}
	export class UpdateDraftQueryDTO {
	    requestId: string;
	    queryJson: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateDraftQueryDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.requestId = source["requestId"];
	        this.queryJson = source["queryJson"];
	    }
	}
	export class UpdateDraftTextBodyDTO {
	    requestId: string;
	    textBody: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateDraftTextBodyDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.requestId = source["requestId"];
	        this.textBody = source["textBody"];
	    }
	}
	export class UpdateDraftUrlDTO {
	    requestId: string;
	    url: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateDraftUrlDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.requestId = source["requestId"];
	        this.url = source["url"];
	    }
	}
	export class UpdateDraftUrlEncodedFormDTO {
	    requestId: string;
	    urlencodedJson: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateDraftUrlEncodedFormDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.requestId = source["requestId"];
	        this.urlencodedJson = source["urlencodedJson"];
	    }
	}
	export class UpdateOpenTabsDTO {
	    openTabsJson: string;
	
	    static createFrom(source: any = {}) {
	        return new UpdateOpenTabsDTO(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.openTabsJson = source["openTabsJson"];
	    }
	}

}

