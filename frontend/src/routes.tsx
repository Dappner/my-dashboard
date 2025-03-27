import { ReactNode } from "react";
import { Outlet, RouteObject } from "react-router-dom";
import HomePage from "@/features/Home/HomePage";
import InvestingPage from "@/features/Investing/InvestingPage";
import LoginPage from "@/features/Auth/Login";
import ResearchPage from "@/features/Investing/pages/Research/ResearchPage";
import ManageInvestingPage from "@/features/Investing/pages/ManageInvesting/ManageInvestingPage";
import TickerPage from "@/features/Investing/pages/Research/TickerPage";
import SettingsPage from "@/features/Settings/SettingsPage";
import TransactionsPage from "@/features/Investing/pages/Transactions/TransactionsPage";
import HoldingsPage from "@/features/Investing/pages/Holdings/HoldingsPage";
import AlertsPage from "@/features/Investing/pages/AlertsPage";
import SpendingPage from "@/features/Spending/SpendingPage";
import ReceiptsPage from "@/features/Spending/pages/ReceiptsPage";

// Define the shape of your custom handle object
interface AppRouteHandle {
  crumb?: (data?: any) => ReactNode;
  title?: string;
}

// *** Augment the official RouteObject type ***
export type AppRouteObject = RouteObject & {
  handle?: AppRouteHandle; // Add your custom handle
  children?: AppRouteObject[]; // Ensure children also use the augmented type
};

// Your route configuration, now using the augmented AppRouteObject type
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
          // Crumb usually inherited or is the final part based on parent
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
    element: <SpendingPage />, // Assuming SpendingPage renders an <Outlet /> for its children
    handle: { title: "Spending Overview", crumb: () => "Spending" },
    children: [
      // Optional: Index route for default /spending content if needed
      // { index: true, element: <SpendingOverviewContent />, handle: { title: "Overview" } },
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

// Login route definition (can also use AppRouteObject)
export const loginRoute: AppRouteObject = {
  path: "/login",
  element: <LoginPage />,
  handle: { title: "Login" },
};
