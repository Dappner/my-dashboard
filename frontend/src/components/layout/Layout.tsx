import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Navigate, Outlet, useLocation } from "react-router";
import { AppSidebar } from "./components/AppSidebar";
import RouteBreadcrumbs from "./components/RouteBreadcrumbs";
import { useAuthContext } from "@/contexts/AuthContext";
import { Toaster } from "../ui/sonner";
import LoadingSpinner from "./components/LoadingSpinner";
import useUser from "@/hooks/useUser";

export default function Layout() {
  const { user: authUser, isLoading } = useAuthContext();
  const { isLoading: userLoading } = useUser();
  const location = useLocation();

  if (isLoading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  if (!authUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-h-dvh bg-gray-50">
        <RouteBreadcrumbs />
        <main className="p-4 sm:p-8 pt-0 sm:pt-0">
          <Outlet />
          <Toaster richColors />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
