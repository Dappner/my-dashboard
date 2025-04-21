import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { SheetContainer } from "../SheetContainer";
import { Toaster } from "../ui/sonner";
import { SidebarProvider } from "./Sidebar/providers/SidebarProvider";
import { AppSidebar } from "./components/AppSidebar";
import { BottomNav } from "./components/BottomNav";
import { MobileHeader } from "./components/MobileHeader";
import { useTheme } from "@/hooks/useTheme";

export default function Layout() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  useTheme();

  if (location.pathname === "/") {
    navigate({ to: "/home" });
  }

  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden bg-background">
          {isMobile && <MobileHeader />}
          <main
            className={cn("flex-1 overflow-y-auto p-0", isMobile && "pb-16")}
          >
            <Outlet />
          </main>

          {isMobile && <BottomNav />}
          <Toaster richColors position="bottom-right" />
          <SheetContainer />
        </div>
      </div>
    </SidebarProvider>
  );
}
