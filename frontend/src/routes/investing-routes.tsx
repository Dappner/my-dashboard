import InvestingPage from "@/features/Investing/InvestingPage";
import AlertsPage from "@/features/Investing/pages/AlertsPage";
import ForexPage from "@/features/Investing/pages/ForexPage";
import HoldingsPage from "@/features/Investing/pages/Holdings/HoldingsPage";
import IndustryPage from "@/features/Investing/pages/IndustryPage";
import ManageInvestingPage from "@/features/Investing/pages/ManageInvesting/ManageInvestingPage";
import ResearchPage from "@/features/Investing/pages/Research/ResearchPage";
import TickerPage from "@/features/Investing/pages/Research/TickerPage";
import SectorPage from "@/features/Investing/pages/SectorPage";
import TransactionsPage from "@/features/Investing/pages/Transactions/TransactionsPage";
import { createRoute } from "@tanstack/react-router";
import { layoutRoute } from ".";

// Parent investing route
export const investingRoute = createRoute({
	getParentRoute: () => layoutRoute,
	path: "investing",
});

// Dashboard route
export const investingDashboardRoute = createRoute({
	getParentRoute: () => investingRoute,
	path: "/",
	component: InvestingPage,
});

// Manage route
export const investingManageRoute = createRoute({
	getParentRoute: () => investingRoute,
	path: "manage",
	component: ManageInvestingPage,
});

// Holdings route
export const investingHoldingsRoute = createRoute({
	getParentRoute: () => investingRoute,
	path: "holdings",
	component: HoldingsPage,
});

// Transactions route
export const investingTransactionsRoute = createRoute({
	getParentRoute: () => investingRoute,
	path: "transactions",
	component: TransactionsPage,
});

// Research route
export const investingResearchRoute = createRoute({
	getParentRoute: () => investingRoute,
	path: "research",
	component: ResearchPage,
});

// Forex route
export const investingForexRoute = createRoute({
	getParentRoute: () => investingRoute,
	path: "forex",
	component: ForexPage,
});

// Industry route
export const investingIndustryRoute = createRoute({
	getParentRoute: () => investingRoute,
	path: "industry/$industrySlug",
	component: IndustryPage,
});

// Sector route
export const investingSectorRoute = createRoute({
	getParentRoute: () => investingRoute,
	path: "sector/$sectorSlug",
	component: SectorPage,
});

// Ticker route
export const investingTickerRoute = createRoute({
	getParentRoute: () => investingRoute,
	path: "ticker/$exchange/$ticker",
	component: TickerPage,
});

// Alerts route
export const investingAlertsRoute = createRoute({
	getParentRoute: () => investingRoute,
	path: "alerts",
	component: AlertsPage,
});

// Export all investing routes as an array to be added to the router
export const investingRoutes = [
	investingRoute.addChildren([
		investingDashboardRoute,
		investingManageRoute,
		investingHoldingsRoute,
		investingTransactionsRoute,
		investingResearchRoute,
		investingForexRoute,
		investingIndustryRoute,
		investingSectorRoute,
		investingTickerRoute,
		investingAlertsRoute,
	]),
];
