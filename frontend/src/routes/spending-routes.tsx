import SpendingPage from "@/features/Spending/SpendingPage";
import ReceiptDetailPage from "@/features/Spending/pages/ReceiptDetailsPage/ReceiptDetailPage";
import ReceiptsPage from "@/features/Spending/pages/ReceiptsPage";
import { SpendingCategoriesPage } from "@/features/Spending/pages/SpendingCategoriesPage/SpendingCategoriesPage";
import SpendingCategoryDetailPage from "@/features/Spending/pages/SpendingCategoryDetailPage";
import { createRoute } from "@tanstack/react-router";
import { layoutRoute } from ".";
import { z } from "zod";

const monthSearchSchema = z.object({
	month: z
		.string()
		.regex(/^\d{4}-\d{2}$/, "Month must be in format YYYY-MM")
		.optional()
		.transform((val) => (val ? val : undefined)),
});

// Parent spending route
export const spendingRoute = createRoute({
	getParentRoute: () => layoutRoute,
	path: "spending",
});

// Dashboard route
export const spendingDashboardRoute = createRoute({
	getParentRoute: () => spendingRoute,
	path: "/",
	component: SpendingPage,
	validateSearch: monthSearchSchema,
});

// Receipts parent route
export const spendingReceiptsRoute = createRoute({
	getParentRoute: () => spendingRoute,
	path: "receipts",
});

// Receipts list route
export const spendingReceiptsListRoute = createRoute({
	getParentRoute: () => spendingReceiptsRoute,
	path: "/",
	component: ReceiptsPage,
});

// Receipt detail route
export const spendingReceiptDetailRoute = createRoute({
	getParentRoute: () => spendingReceiptsRoute,
	path: "/$receiptId",
	component: ReceiptDetailPage,
});

// Categories parent route
export const spendingCategoriesRoute = createRoute({
	getParentRoute: () => spendingRoute,
	path: "categories",
});

// Categories list route
export const spendingCategoriesListRoute = createRoute({
	getParentRoute: () => spendingCategoriesRoute,
	path: "/",
	component: SpendingCategoriesPage,
	// validateSearch: zodValidator(monthSearchSchema),
});

// Category detail route
export const spendingCategoryDetailRoute = createRoute({
	getParentRoute: () => spendingCategoriesRoute,
	path: "$categoryId",
	component: SpendingCategoryDetailPage,
	validateSearch: monthSearchSchema,
});

// Export all spending routes as an array to be added to the router
export const spendingRoutes = [
	spendingRoute.addChildren([
		spendingDashboardRoute,
		spendingReceiptsRoute.addChildren([
			spendingReceiptsListRoute,
			spendingReceiptDetailRoute,
		]),
		spendingCategoriesRoute.addChildren([
			spendingCategoriesListRoute,
			spendingCategoryDetailRoute,
		]),
	]),
];
