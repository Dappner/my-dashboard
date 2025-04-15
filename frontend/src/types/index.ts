import type { RouteObject } from "react-router-dom";

export interface AppRouteHandle<
	TParams extends Record<string, string> = Record<string, string>,
> {
	crumb?: (data: {
		data: unknown;
		params: TParams;
	}) => React.ReactNode;
	title?: string;
}

export type AppRouteObject = RouteObject & {
	// biome-ignore lint/suspicious/noExplicitAny: This is delicate and is best achieved with any... Can't think of a better way..
	handle?: AppRouteHandle<any>;
	children?: AppRouteObject[];
};
