export namespace main {
	
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
	    body: string;
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
	        this.body = source["body"];
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

}

