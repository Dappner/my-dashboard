import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Outlet } from "@tanstack/react-router";
import { SheetContainer } from "../SheetContainer";
import { Toaster } from "../ui/sonner";
import { SidebarTrigger } from "./Sidebar/components/SidebarTrigger";
import { SidebarProvider } from "./Sidebar/providers/SidebarProvider";
import { AppSidebar } from "./components/AppSidebar";
import { BottomNav } from "./components/BottomNav";

export default function Layout() {
	const isMobile = useIsMobile();
	return (
		<SidebarProvider>
			<div className="flex h-dvh w-full">
				<AppSidebar />
				<div className="flex flex-1 flex-col overflow-hidden bg-gray-50">
					{isMobile && (
						<header className="sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
							<div className="flex items-center gap-2">
								{isMobile && <SidebarTrigger />}
								<h1 className="text-lg font-semibold">My Dashboard</h1>
							</div>
						</header>
					)}
					<main
						className={cn("flex-1 overflow-y-auto p-0", isMobile && "pb-16")}
					>
						<Outlet />
					</main>

					{isMobile && <BottomNav />}
					<Toaster richColors position="top-right" />
					<SheetContainer />
				</div>
			</div>
		</SidebarProvider>
	);
}
