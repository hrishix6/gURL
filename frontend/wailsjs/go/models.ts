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
	export class GurlBody {
	    isText: boolean;
	    filepath: string;
	    suggestedName: string;
	    extension: string;
	    textContent: string;
	
	    static createFrom(source: any = {}) {
	        return new GurlBody(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.isText = source["isText"];
	        this.filepath = source["filepath"];
	        this.suggestedName = source["suggestedName"];
	        this.extension = source["extension"];
	        this.textContent = source["textContent"];
	    }
	}
	export class GurlKeyValItem {
	    key: string;
	    value: string;
	
	    static createFrom(source: any = {}) {
	        return new GurlKeyValItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.value = source["value"];
	    }
	}
	export class GurlKeyValMultiPartItem {
	    key: string;
	    value: string;
	    isFile: boolean;
	
	    static createFrom(source: any = {}) {
	        return new GurlKeyValMultiPartItem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.value = source["value"];
	        this.isFile = source["isFile"];
	    }
	}
	export class GurlReq {
	    id: string;
	    method: string;
	    url: string;
	    bodyType: string;
	    headers: GurlKeyValItem[];
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
	        this.headers = this.convertValues(source["headers"], GurlKeyValItem);
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
	export class GurlRes {
	    id: string;
	    status: number;
	    statusText: string;
	    success: boolean;
	    headers: GurlKeyValItem[];
	    body?: GurlBody;
	    isFile: boolean;
	    size: number;
	    time: number;
	
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
	        this.body = this.convertValues(source["body"], GurlBody);
	        this.isFile = source["isFile"];
	        this.size = source["size"];
	        this.time = source["time"];
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

