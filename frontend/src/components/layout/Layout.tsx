import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Outlet } from "@tanstack/react-router";
import { SheetContainer } from "../SheetContainer";
import { Toaster } from "../ui/sonner";
import { AppSidebar } from "./components/AppSidebar";
import { ResponsiveHeader } from "./components/ResponsiveHeader";

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex h-dvh w-full">
        <AppSidebar />
        <SidebarInset
          className={cn("flex flex-1 flex-col overflow-hidden bg-gray-50")}
        >
          <ResponsiveHeader className="flex-shrink-0" />

          <main className={cn("flex-1 overflow-y-auto p-0")}>
            <Outlet />
          </main>

          <Toaster richColors position="top-right" />
          <SheetContainer />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
