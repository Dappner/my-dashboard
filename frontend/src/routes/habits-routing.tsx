import HabitsPage from "@/features/Habits/HabitsPage";
import ChessPage from "@/features/Habits/pages/ChessPage/ChessPage";
import { createRoute } from "@tanstack/react-router";
import { layoutRoute } from ".";

export const habitsRoute = createRoute({
	getParentRoute: () => layoutRoute,
	path: "habits",
});

export const habitsDashboardRoute = createRoute({
	getParentRoute: () => habitsRoute,
	path: "/",
	component: HabitsPage,
});

export const chessRoute = createRoute({
	getParentRoute: () => habitsRoute,
	path: "chess",
	component: ChessPage,
});

export const habitsRoutes = [
	habitsRoute.addChildren([habitsDashboardRoute, chessRoute]),
];
