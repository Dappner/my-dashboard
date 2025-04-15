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
import type { AppRouteObject } from "@/types";
import { Outlet } from "react-router-dom";

export const investingRoutes: AppRouteObject[] = [
  {
    path: "investing",
    element: <Outlet />,
    handle: {
      crumb: () => "Investing",
    },
    children: [
      {
        index: true,
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
          crumb: ({ params }) => `Industry: ${params.industrySlug || ""}`,
        },
      },
      {
        path: "sector/:sectorSlug",
        element: <SectorPage />,
        handle: {
          title: "Sector Performance",
          crumb: ({ params }) => `Sector: ${params.sectorSlug || ""}`,
        },
      },
      {
        path: "ticker/:exchange/:ticker",
        element: <TickerPage />,
        handle: {
          title: "Stock Details",
          crumb: ({ params }) =>
            params.ticker ? `Stock: ${params.ticker.toUpperCase()}` : "Stock",
        },
      },
      {
        path: "alerts",
        element: <AlertsPage />,
        handle: { title: "Alerts", crumb: () => "Alerts" },
      },
    ],
  },
];
