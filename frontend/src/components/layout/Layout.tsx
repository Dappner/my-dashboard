import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Navigate, Outlet, useLocation } from "react-router";
import { AppSidebar } from "./components/AppSidebar";
import { useAuthContext } from "@/contexts/AuthContext";
import { Toaster } from "../ui/sonner";
import LoadingSpinner from "./components/LoadingSpinner";
import useUser from "@/hooks/useUser";
import { HeaderProvider } from "@/contexts/HeaderContext";
import { ResponsiveHeader } from "./components/ResponsiveHeader";
import { cn } from "@/lib/utils";

export default function Layout() {
  const { user: authUser, isLoading: authLoading } = useAuthContext();
  const { isLoading: userLoading } = useUser();
  const location = useLocation();

  const isLoading = authLoading || userLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return (
    <HeaderProvider>
      <SidebarProvider>
        <div className="flex h-dvh w-full">
          <AppSidebar />
          <SidebarInset
            className={cn(
              "flex flex-1 flex-col overflow-hidden bg-gray-50",
            )}
          >
            <ResponsiveHeader className="flex-shrink-0" />

            <main
              className={cn(
                "flex-1 overflow-y-auto p-0 sm:p-4 md:p-8",
              )}
            >
              <Outlet />
            </main>

            {/* Toaster remains outside the scrollable area */}
            <Toaster richColors position="top-right" />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </HeaderProvider>
  );
}
