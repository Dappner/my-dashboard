import LoginPage from "@/features/Auth/Login";
import HomePage from "@/features/Home/HomePage";
import InvestingPage from "@/features/Investing/InvestingPage";
import AlertsPage from "@/features/Investing/pages/AlertsPage";
import HoldingsPage from "@/features/Investing/pages/Holdings/HoldingsPage";
import ManageInvestingPage from "@/features/Investing/pages/ManageInvesting/ManageInvestingPage";
import ResearchPage from "@/features/Investing/pages/Research/ResearchPage";
import TickerPage from "@/features/Investing/pages/Research/TickerPage";
import TransactionsPage from "@/features/Investing/pages/Transactions/TransactionsPage";
import SettingsPage from "@/features/Settings/SettingsPage";
import SpendingPage from "@/features/Spending/SpendingPage";
import ReceiptsPage from "@/features/Spending/pages/ReceiptsPage";
import type { ReactNode } from "react";
import { Outlet, type RouteObject } from "react-router-dom";

interface AppRouteHandle {
	crumb?: (data?: any) => ReactNode;
	title?: string;
}

// *** Augment the official RouteObject type ***
export type AppRouteObject = RouteObject & {
	handle?: AppRouteHandle;
	children?: AppRouteObject[];
};

export const routeConfig: AppRouteObject[] = [
	{
		path: "/",
		element: <HomePage />,
		handle: {
			title: "Home",
			crumb: () => "Home",
		},
	},
	{
		path: "/investing",
		element: <Outlet />, // Parent uses Outlet
		handle: {
			// Parent handle defines the base crumb for this section
			crumb: () => "Investing",
		},
		children: [
			{
				index: true, // Index route for /investing
				element: <InvestingPage />,
				handle: {
					title: "Investment Dashboard",
				},
			},
			{
				path: "manage",
				element: <ManageInvestingPage />,
				handle: { title: "Manage Investments", crumb: () => "Manage" },
			},
			{
				path: "holdings",
				element: <HoldingsPage />,
				handle: { title: "Holdings", crumb: () => "Holdings" },
			},
			{
				path: "transactions",
				element: <TransactionsPage />,
				handle: { title: "Transactions", crumb: () => "Transactions" },
			},
			{
				path: "research",
				element: <ResearchPage />,
				handle: { title: "Research", crumb: () => "Research" },
			},
			{
				path: "stock/:exchange/:ticker",
				element: <TickerPage />,
				handle: {
					title: "Stock Details",
					crumb: (data: { params: { ticker: string } }) =>
						`Stock: ${data.params.ticker.toUpperCase()}`,
				},
			},
			{
				path: "alerts",
				element: <AlertsPage />,
				handle: { title: "Alerts", crumb: () => "Alerts" },
			},
		],
	},
	{
		path: "spending",
		element: <Outlet />,
		handle: { title: "Spending Overview", crumb: () => "Spending" },
		children: [
			{
				index: true,
				element: <SpendingPage />,
				handle: {
					title: "Spending Dashboard",
				},
			},
			{
				path: "receipts",
				element: <ReceiptsPage />,
				handle: { title: "Receipts", crumb: () => "Receipts" },
			},
		],
	},
	{
		path: "settings",
		element: <SettingsPage />,
		handle: { title: "Settings", crumb: () => "Settings" },
	},
];

export const loginRoute: AppRouteObject = {
	path: "/login",
	element: <LoginPage />,
	handle: { title: "Login" },
};
