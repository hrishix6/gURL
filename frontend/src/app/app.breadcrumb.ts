import {
	Component,
	DestroyRef,
	HostBinding,
	inject,
	signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FindDraftById, FindEnvDraft } from "@wailsjs/go/storage/Storage";
import {
	Container,
	Layers,
	LucideAngularModule,
	RadioTower,
} from "lucide-angular";
import { AppService, TabsService } from "./services";
import { AppTabType } from "./types";

enum CrumbType {
	Req = "Request",
	Collections = "Collection",
	Env = "Environment",
}

@Component({
	selector: "div[gurl-breadcrumbs]",
	template: `
        @if (crumbs().length > 0) {
            <ul>
                @for (crumb of crumbs(); track $index) {
                    <li>
                        <a class="hover:decoration-0 hover:cursor-default">
                            @switch (crumb.type) {
                                @case ("Collection") {
                                    <lucide-angular [img]="CollectionsIcon" class="size-4" />
                                }
                                @case ("Environment") {
                                    <lucide-angular [img]="EnvironmentIcon" class="size-4" />
                                }
                                @case ("Request") {
                                    <lucide-angular [img]="RequestsIcon" class="size-4" />
                                }
                            }
                            {{crumb.name}}
                        </a>
                    </li>
                }
            </ul>
        }
    `,
	imports: [LucideAngularModule],
})
export class Breadcrumbs {
	@HostBinding("class")
	readonly hostClass = "breadcrumbs overflow-x-auto whitespace-nowrap";

	constructor() {
		this.tabSvc.activeTabChanges$
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((tabId: string) => {
				this.loadCrumbs(tabId);
			});

		this.tabSvc.refreshNotifier
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe((tabType: AppTabType) => {
				const currentTabId = this.tabid();
				if (currentTabId) {
					const tab = this.tabSvc.getTabById(currentTabId);
					if (tab && tab.entityType === tabType) {
						this.loadCrumbs(currentTabId);
					}
				}
			});

		this.appSvc.refreshBreadcrumb$
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(() => {
				const currentTabId = this.tabid();
				if (currentTabId) {
					this.loadCrumbs(currentTabId);
				}
			});
	}

	ngOnInit(): void {
		const activeTabId = this.tabSvc.activeTab();
		if (activeTabId) {
			this.loadCrumbs(activeTabId);
		}
	}

	private destroyRef = inject(DestroyRef);
	private readonly tabSvc = inject(TabsService);
	private readonly appSvc = inject(AppService);
	private tabid = signal<string>("");
	protected crumbs = signal<{ type: CrumbType; name: string }[]>([]);

	protected readonly CollectionsIcon = Layers;
	protected readonly EnvironmentIcon = Container;
	protected readonly RequestsIcon = RadioTower;

	protected loadCrumbs(tabId: string) {
		this.tabid.set(tabId);
		const tab = this.tabSvc.getTabById(tabId);
		if (tab) {
			switch (tab.entityType) {
				case AppTabType.Req: {
					FindDraftById(tab.entityId)
						.then((draft) => {
							if (draft) {
								const { parentCollectionId, parentRequestId } = draft;
								if (parentRequestId) {
									const req = this.appSvc
										.savedRequests()
										.find((r) => r.id === parentRequestId)?.name;
									const collection = this.appSvc
										.collections()
										.find((c) => c.id === parentCollectionId)?.name;
									this.crumbs.set([
										{
											type: CrumbType.Collections,
											name: collection || "Unnamed Collection",
										},
										{ type: CrumbType.Req, name: req || "Unnamed Request" },
									]);
								} else {
									this.crumbs.set([{ type: CrumbType.Req, name: tab.name }]);
								}
							}
						})
						.catch((err) => {
							console.error(err);
						});
					break;
				}
				case AppTabType.Env: {
					FindEnvDraft(tab.entityId)
						.then((draft) => {
							if (draft) {
								const env = this.appSvc
									.environments()
									.find((e) => e.id === draft.parentEnvId)?.name;
								this.crumbs.set([
									{ type: CrumbType.Env, name: env || tab.name },
								]);
							}
						})
						.catch((err) => {
							console.error(err);
						});
					break;
				}
				default: {
					break;
				}
			}
		}
	}
}
