import Layout from "@/components/layout/Layout";
import LoginPage from "@/features/Auth/Login";
import HomePage from "@/features/Home/HomePage";
import SettingsPage from "@/features/Settings/SettingsPage";
import {
	createRootRoute,
	createRoute,
	createRouter,
} from "@tanstack/react-router";
import { investingRoutes } from "./investing-routes";
import { spendingRoutes } from "./spending-routes";

export const rootRoute = createRootRoute({});

export const layoutRoute = createRoute({
	path: "/",
	getParentRoute: () => rootRoute,
	component: Layout,
});

// Home Route
export const homeRoute = createRoute({
	getParentRoute: () => layoutRoute,
	path: "/",
	component: HomePage,
});

// Settings Route
export const settingsRoute = createRoute({
	getParentRoute: () => layoutRoute,
	path: "/settings",
	component: SettingsPage,
});

// Login Route (outside main layout)
export const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "login",
	component: LoginPage,
});

// The root router that includes all routes
const routeTree = rootRoute.addChildren([
	homeRoute,
	...investingRoutes,
	...spendingRoutes,
	settingsRoute,
	loginRoute,
]);

// Create and export the router
export const router = createRouter({ routeTree });
