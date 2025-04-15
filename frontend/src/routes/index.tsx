import AuthWrapper from "@/components/auth/Authwrapper";
import Layout from "@/components/layout/Layout";
import LoginPage from "@/features/Auth/Login";
import HabitsPage from "@/features/Habits/HabitsPage";
import HomePage from "@/features/Home/HomePage";
import SettingsPage from "@/features/Settings/SettingsPage";
import TimePage from "@/features/Time/TimePage";
import {
	createRootRoute,
	createRoute,
	createRouter,
} from "@tanstack/react-router";
import { investingRoutes } from "./investing-routes";
import { spendingRoutes } from "./spending-routes";

export const rootRoute = createRootRoute({
	component: AuthWrapper,
});

export const loginRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "login",
	component: LoginPage,
});

export const layoutRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: Layout,
});

export const homeRoute = createRoute({
	path: "home",
	getParentRoute: () => layoutRoute,
	component: HomePage,
});

export const settingsRoute = createRoute({
	getParentRoute: () => layoutRoute,
	path: "settings",
	component: SettingsPage,
});

export const habitsRoute = createRoute({
	getParentRoute: () => layoutRoute,
	path: "habits",
	component: HabitsPage,
});

export const timeRoute = createRoute({
	getParentRoute: () => layoutRoute,
	path: "time-tracking",
	component: TimePage,
});

const routeTree = rootRoute.addChildren([
	loginRoute,
	layoutRoute.addChildren([
		homeRoute,
		settingsRoute,
		...investingRoutes,
		...spendingRoutes,
		habitsRoute,
		timeRoute,
	]),
]);

export const router = createRouter({ routeTree });
