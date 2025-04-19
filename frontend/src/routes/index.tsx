import AuthWrapper from "@/components/auth/AuthWrapper";
import Layout from "@/components/layout/Layout";
import NotFoundComponent from "@/components/layout/NotFoundComponent";
import AccountPage from "@/features/Account/AccountPage";
import LoginPage from "@/features/Auth/Login";
import HomePage from "@/features/Home/HomePage";
import {
	createRootRoute,
	createRoute,
	createRouter,
	useNavigate,
} from "@tanstack/react-router";
import { habitsRoutes } from "./habits-routing";
import { investingRoutes } from "./investing-routes";
import { readingRoutes } from "./reading-routes";
import { spendingRoutes } from "./spending-routes";

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
	notFoundComponent: NotFoundComponent,
});

export const homeRoute = createRoute({
	path: "home",
	getParentRoute: () => layoutRoute,
	component: HomePage,
});

export const accountRoute = createRoute({
	getParentRoute: () => layoutRoute,
	path: "account",
	component: AccountPage,
});

export const splatRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "$",
	component: () => {
		const navigate = useNavigate();
		navigate({ to: "/home" });
		return null;
	},
});

const routeTree = rootRoute.addChildren([
	loginRoute,
	layoutRoute.addChildren([
		homeRoute,
		...investingRoutes,
		...spendingRoutes,
		...readingRoutes,
		...habitsRoutes,
		accountRoute,
		splatRoute,
	]),
]);

export const router = createRouter({ routeTree });
