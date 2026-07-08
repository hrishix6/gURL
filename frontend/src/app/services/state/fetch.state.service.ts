import { computed, Injectable, signal } from "@angular/core";
import type { FetchState } from "@/types";

@Injectable({
	providedIn: "root",
})
/**
 * This service holds metadata of fetch entities whether it is loaded, loading, errored and how many attempts
 * for ex. `app_collections` is a fetch entity
 *   {
 *     "app_collections":  { loading: false, loaded: false, error: false, attempts: 0}
 *   }
 *  This means app has not loaded collections, based on this initial attempt will be made to load collections and accordinly this will be updated
 */
export class FetchStateService {
	private _fetchState = signal<Record<string, FetchState>>({});

	public fetchState = computed(() => this._fetchState());

	public init(fetchEntityId: string) {
		if (fetchEntityId in this._fetchState()) {
			return this._fetchState()[fetchEntityId];
		}
		this._fetchState.update((prev) => ({
			...prev,
			[fetchEntityId]: {
				attempts: 0,
				error: false,
				loaded: false,
				loading: false,
			},
		}));

		return this._fetchState()[fetchEntityId];
	}

	public start(fetchEntityId: string) {
		this._fetchState.update((prev) => ({
			...prev,
			[fetchEntityId]: {
				...prev[fetchEntityId],
				loading: true,
				loaded: false,
				error: false,
			},
		}));
	}

	public loaded(fetchEntityId: string) {
		this._fetchState.update((prev) => ({
			...prev,
			[fetchEntityId]: {
				...prev[fetchEntityId],
				loaded: true,
			},
		}));
	}

	public error(fetchEntityId: string) {
		this._fetchState.update((prev) => ({
			...prev,
			[fetchEntityId]: {
				...prev[fetchEntityId],
				error: true,
			},
		}));
	}

	public end(fetchEntityId: string) {
		this._fetchState.update((prev) => ({
			...prev,
			[fetchEntityId]: {
				...prev[fetchEntityId],
				attempts: prev[fetchEntityId].attempts + 1,
				loading: false,
			},
		}));
	}

	public clean() {
		this._fetchState.set({});
	}

	public requestsFKey(collectionId: string) {
		return `app_${collectionId}_requests`;
	}

	public exampleFKey(collectionId: string) {
		return `app_${collectionId}_examples`;
	}

	public mocksKey(collectionId: string) {
		return `app_${collectionId}_mocks`;
	}
}
