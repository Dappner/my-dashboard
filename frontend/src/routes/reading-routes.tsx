import ReadingPage from "@/features/Reading/ReadingPage";
import AuthorDetailPage from "@/features/Reading/pages/AuthorDetailPage";
import BookDetailPage from "@/features/Reading/pages/BookDetailPage";
import { createRoute } from "@tanstack/react-router";
import { layoutRoute } from ".";

export const readingRoute = createRoute({
	getParentRoute: () => layoutRoute,
	path: "reading",
});

export const readingDashboardRoute = createRoute({
	getParentRoute: () => readingRoute,
	path: "/",
	component: ReadingPage,
});

export const bookDetailRoute = createRoute({
	getParentRoute: () => readingRoute,
	path: "books/$bookId",
	component: BookDetailPage,
});

export const authorDetailRoute = createRoute({
	getParentRoute: () => readingRoute,
	path: "authors/$authorId",
	component: AuthorDetailPage,
});

export const readingRoutes = [
	readingRoute.addChildren([
		readingDashboardRoute,
		bookDetailRoute,
		authorDetailRoute,
	]),
];
