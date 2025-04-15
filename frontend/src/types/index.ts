import type { Route, RouteComponent } from "@tanstack/react-router";
// New TanStack Router types
export interface AppRouteMeta {
	title?: string;
	breadcrumb?: (options: { params: Record<string, string> }) => React.ReactNode;
	requiresAuth?: boolean;
	standalone?: boolean;
}

export type AppRouteComponent = RouteComponent & {
	meta?: AppRouteMeta;
};

export type AppRoute = Route<{
	meta: AppRouteMeta;
	params: Record<string, string>;
	search: Record<string, string>;
}>;
