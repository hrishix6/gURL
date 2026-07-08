declare global {
	interface Window {
		pdfWorkerSrc?: string;
		turnstile: Turnstile;
	}
	interface Turnstile {
		render: (
			el: string,
			options: {
				sitekey: string;
				size: string;
				retry: string;
				callback(token: string): void;
			},
		) => string;
		reset: (widgetId: string) => void;
		remove: (widgetId: string) => void;
	}
}

export {};
