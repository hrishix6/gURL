import type { Routes } from "@angular/router";
import {
	activeWorkspaceResolver,
	workspaceDataResolver,
	workspacesResolver,
} from "./resolvers";
import { WorkspacesHome } from "./workspaces";

const appRoutes: Routes = [
	{
		path: "workspaces",
		component: WorkspacesHome,
		resolve: {
			workspaces: workspacesResolver,
			activeWorkspace: activeWorkspaceResolver,
		},
		children: [
			{
				path: ":id",
				loadComponent: () => import("./workspace"),
				resolve: {
					workspaceData: workspaceDataResolver,
				},
			},
		],
	},
];

export default appRoutes;
