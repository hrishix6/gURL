declare global {
	interface Window {
		pdfWorkerSrc?: string;
		turnstile: Turnstile;
	}
	interface Turnstile {
		render: (el: string, options: any) => string;
		reset: (widgetId: string) => void;
		remove: (widgetId: string) => void;
	}
}

export {};
