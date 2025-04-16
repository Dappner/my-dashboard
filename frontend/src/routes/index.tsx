import AuthWrapper from "@/components/auth/Authwrapper";
import Layout from "@/components/layout/Layout";
import LoginPage from "@/features/Auth/Login";
import HabitsPage from "@/features/Habits/HabitsPage";
import HomePage from "@/features/Home/HomePage";
import TimePage from "@/features/Time/TimePage";
import {
	createRootRoute,
	createRoute,
	createRouter,
} from "@tanstack/react-router";
import { investingRoutes } from "./investing-routes";
import { spendingRoutes } from "./spending-routes";
import AccountPage from "@/features/Account/AccountPage";
import NotFoundComponent from "@/components/layout/NotFoundComponent";

export const rootRoute = createRootRoute({
	component: AuthWrapper,
	notFoundComponent: NotFoundComponent,
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
export const accountRoute = createRoute({
	getParentRoute: () => layoutRoute,
	path: "account",
	component: AccountPage,
});

const routeTree = rootRoute.addChildren([
	loginRoute,
	layoutRoute.addChildren([
		homeRoute,
		...investingRoutes,
		...spendingRoutes,
		habitsRoute,
		timeRoute,
		accountRoute,
	]),
]);

export const router = createRouter({ routeTree });
