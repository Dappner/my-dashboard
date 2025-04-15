import SpendingPage from "@/features/Spending/SpendingPage";
import ReceiptDetailPage from "@/features/Spending/pages/ReceiptDetailsPage/ReceiptDetailPage";
import ReceiptsPage from "@/features/Spending/pages/ReceiptsPage";
import { SpendingCategoriesPage } from "@/features/Spending/pages/SpendingCategoriesPage/SpendingCategoriesPage";
import SpendingCategoryDetailPage from "@/features/Spending/pages/SpendingCategoryDetailPage";
import { createRoute } from "@tanstack/react-router";
import { layoutRoute } from ".";

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
});

// Dashboard with month parameter
export const spendingDashboardMonthRoute = createRoute({
	getParentRoute: () => spendingRoute,
	path: "$month",
	component: SpendingPage,
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
	path: "$receiptId",
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
});

// Categories with month parameter
export const spendingCategoriesMonthRoute = createRoute({
	getParentRoute: () => spendingCategoriesRoute,
	path: "$month",
	component: SpendingCategoriesPage,
});

// Category detail route
export const spendingCategoryDetailRoute = createRoute({
	getParentRoute: () => spendingCategoriesRoute,
	path: "$categoryId",
	component: SpendingCategoryDetailPage,
});

// Category detail with month parameter
export const spendingCategoryDetailMonthRoute = createRoute({
	getParentRoute: () => spendingCategoriesRoute,
	path: "$categoryId/$month",
	component: SpendingCategoryDetailPage,
});

// Export all spending routes as an array to be added to the router
export const spendingRoutes = [
	spendingRoute.addChildren([
		spendingDashboardRoute,
		spendingDashboardMonthRoute,
		spendingReceiptsRoute.addChildren([
			spendingReceiptsListRoute,
			spendingReceiptDetailRoute,
		]),
		spendingCategoriesRoute.addChildren([
			spendingCategoriesListRoute,
			spendingCategoriesMonthRoute,
			spendingCategoryDetailRoute,
			spendingCategoryDetailMonthRoute,
		]),
	]),
];
