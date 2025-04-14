import LoginPage from "@/features/Auth/Login";
import HomePage from "@/features/Home/HomePage";
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
import SettingsPage from "@/features/Settings/SettingsPage";
import SpendingPage from "@/features/Spending/SpendingPage";
import ReceiptDetailPage from "@/features/Spending/pages/ReceiptDetailsPage/ReceiptDetailPage";
import ReceiptsPage from "@/features/Spending/pages/ReceiptsPage";
import { SpendingCategoriesPage } from "@/features/Spending/pages/SpendingCategoriesPage/SpendingCategoriesPage";
import SpendingCategoryDetailPage from "@/features/Spending/pages/SpendingCategoryDetailPage";
import { Outlet, type RouteObject } from "react-router-dom";

export interface AppRouteHandle<
  TParams extends Record<string, string> = Record<string, string>,
> {
  crumb?: (data: {
    data: unknown;
    params: TParams;
  }) => React.ReactNode;
  title?: string;
}

export type AppRouteObject = RouteObject & {
  // biome-ignore lint/suspicious/noExplicitAny: This is delicate and is best achieved with any... Can't think of a better way..
  handle?: AppRouteHandle<any>;
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
        path: "forex",
        element: <ForexPage />,
        handle: { title: "Forex", crumb: () => "Forex" },
      },
      {
        path: "industry/:industrySlug",
        element: <IndustryPage />,
        handle: {
          title: "Industry Performance",
          crumb: (data: { params: { industrySlug: string } }) =>
            `Industry: ${data.params.industrySlug}`,
        } as AppRouteHandle<{ industrySlug: string }>,
      },
      {
        path: "sector/:sectorSlug",
        element: <SectorPage />,
        handle: {
          title: "Sector Performance",
          crumb: (data: { params: { sectorSlug: string } }) =>
            `Sector: ${data.params.sectorSlug}`,
        } as AppRouteHandle<{ sectorSlug: string }>,
      },
      {
        path: "ticker/:exchange/:ticker",
        element: <TickerPage />,
        handle: {
          title: "Stock Details",
          crumb: (data: { params: { ticker: string } }) =>
            `Stock: ${data.params.ticker.toUpperCase()}`,
        } as AppRouteHandle<{ ticker: string }>,
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
        handle: { title: "Receipts", crumb: () => "Receipts" },
        children: [
          {
            index: true,
            element: <ReceiptsPage />,
            handle: { title: null, crumb: () => null },
          },
          {
            path: ":receiptId",
            element: <ReceiptDetailPage />,
            handle: { title: "Receipt Detail", crumb: () => "Receipts" },
          },
        ],
      },
      {
        path: "categories",
        handle: { title: "Categories", crumb: () => "Categories" },
        children: [
          {
            index: true,
            element: <SpendingCategoriesPage />,
            handle: { title: null, crumb: () => null },
          },
          {
            handle: { title: "Category", crumb: () => "Category" },
            path: ":categoryId",
            element: <SpendingCategoryDetailPage />,
          },
        ],
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
