import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { Sidebar } from "../Sidebar/Sidebar";
import { SidebarContent } from "../Sidebar/components/SidebarContent";
import { SidebarHeader } from "../Sidebar/components/SidebarHeader";
import { SidebarRoutes } from "../Sidebar/components/SidebarRoutes";
import { useSidebar } from "../Sidebar/providers/SidebarProvider";
import { NavUser } from "./nav-user";

export function AppSidebar() {
	const { isMobile, state } = useSidebar();
	const expanded = state === "expanded" || isMobile;

	return (
		<Sidebar>
			{!isMobile && <SidebarHeader>Dashboard</SidebarHeader>}
			<SidebarContent>
				<SidebarRoutes />
			</SidebarContent>
			<footer>
				<div className="px-2">
					<Link
						to="/settings"
						className={cn(
							"flex items-center py-2 px-3 my-1 rounded-md text-sm font-medium transition-colors",
							"hover:bg-accent hover:text-accent-foreground",
							!expanded && "justify-center",
						)}
						activeOptions={{ exact: true }}
						activeProps={{ className: "bg-accent text-accent-foreground" }}
					>
						<Bell className={cn("size-5", expanded && "mr-2")} />
						{expanded && <span>Alerts</span>}
					</Link>
				</div>
				<div className="border-t">
					<NavUser />
				</div>
			</footer>
		</Sidebar>
	);
}
