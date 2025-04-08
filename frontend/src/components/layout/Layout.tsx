import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuthContext } from "@/contexts/AuthContext";
import useUser from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { Navigate, Outlet, useLocation } from "react-router";
import { SheetContainer } from "../SheetContainer";
import { Toaster } from "../ui/sonner";
import { AppSidebar } from "./components/AppSidebar";
import LoadingSpinner from "./components/LoadingSpinner";
import { ResponsiveHeader } from "./components/ResponsiveHeader";

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
		<SidebarProvider>
			<div className="flex h-dvh w-full">
				<AppSidebar />
				<SidebarInset
					className={cn("flex flex-1 flex-col overflow-hidden bg-gray-50")}
				>
					<ResponsiveHeader className="flex-shrink-0" />

					<main className={cn("flex-1 overflow-y-auto p-0 ")}>
						<Outlet />
					</main>

					<Toaster richColors position="top-right" />
					<SheetContainer />
				</SidebarInset>
			</div>
		</SidebarProvider>
	);
}
