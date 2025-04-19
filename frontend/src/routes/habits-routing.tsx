import {
	calendarTimeframes,
	rollingTimeframes,
} from "@/components/controls/CustomTimeframeControl";
import HabitsPage from "@/features/Habits/HabitsPage";
import MockHabitsPage from "@/features/Habits/MockHabitsPage";
import ChessPage from "@/features/Habits/pages/ChessPage/ChessPage";
import type { Timeframe } from "@my-dashboard/shared";
import { createRoute } from "@tanstack/react-router";
import { format } from "date-fns";
import { z } from "zod";
import { layoutRoute } from ".";

const allTimeframes: Timeframe[] = [
	...calendarTimeframes,
	...rollingTimeframes,
	"custom",
] as const;

export const timeframeSearchSchema = z.object({
	timeframe: z.enum(allTimeframes).optional().default("m"),
	date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in format YYYY-MM-DD")
		.optional()
		.transform((val) => (val ? val : format(new Date(), "yyyy-MM-dd"))),
});

export const habitsRoute = createRoute({
	getParentRoute: () => layoutRoute,
	path: "habits",
	validateSearch: timeframeSearchSchema,
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

export const mockHabitsDashboard = createRoute({
	getParentRoute: () => habitsRoute,
	path: "/mock",
	component: MockHabitsPage,
});

export const habitsRoutes = [
	habitsRoute.addChildren([
		habitsDashboardRoute,
		chessRoute,
		mockHabitsDashboard,
	]),
];
