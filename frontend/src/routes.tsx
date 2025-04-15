import LoginPage from "@/features/Auth/Login";
import HomePage from "@/features/Home/HomePage";
import type { AppRouteObject } from "./types";
import { investingRoutes } from "./routes/investing-routes";
import { spendingRoutes } from "./routes/spending-routes";
import SettingsPage from "./features/Settings/SettingsPage";

export const routeConfig: AppRouteObject[] = [
  {
    path: "/",
    element: <HomePage />,
    handle: {
      title: "Home",
      crumb: () => "Home",
    },
  },
  ...investingRoutes,
  ...spendingRoutes,
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
