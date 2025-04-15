import LoginPage from "@/features/Auth/Login";
import HomePage from "@/features/Home/HomePage";
import SettingsPage from "./features/Settings/SettingsPage";
import { investingRoutes } from "./routes/investing-routes";
import { spendingRoutes } from "./routes/spending-routes";
import type { AppRouteObject } from "./types";

export const routeConfig: AppRouteObject[] = [
	{
		path: "/",
		element: <HomePage />,
		handle: {
			title: "Home",
			crumb: () => "Home",
		},
	},
	...investingRoutes,
	...spendingRoutes,
	{
		path: "settings",
		element: <SettingsPage />,
		handle: { title: "Settings", crumb: () => "Settings" },
	},
];

export const loginRoute: AppRouteObject = {
	path: "/login",
	element: <LoginPage />,
	handle: { title: "Login" },
};
