import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Navigate, Outlet, useLocation } from "react-router"
import { AppSidebar } from "./components/AppSidebar"
import RouteBreadcrumbs from "./components/RouteBreadcrumbs"
import { useAuthContext } from "@/contexts/AuthContext"
import { Toaster } from "../ui/sonner"
import LoadingSpinner from "./components/LoadingSpinner"

export default function Layout() {
  const { user, isLoading } = useAuthContext();
  const location = useLocation();

  if (isLoading) return <LoadingSpinner />

  if (!user) {
    return < Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <RouteBreadcrumbs />
        <main className="p-8 pt-0">
          <Outlet />
          <Toaster richColors />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
