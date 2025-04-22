import { ThemeSwitcher } from "@/components/controls/ThemeSwitcher";
import { Sidebar } from "../Sidebar/Sidebar";
import { SidebarContent } from "../Sidebar/components/SidebarContent";
import { SidebarHeader } from "../Sidebar/components/SidebarHeader";
import { SidebarRoutes } from "../Sidebar/components/SidebarRoutes";
import { useSidebar } from "../Sidebar/providers/SidebarProvider";
import { NavUser } from "./nav-user";
import { Separator } from "@/components/ui/separator";

export function AppSidebar() {
	const { state, isMobile } = useSidebar();

	return (
		<Sidebar>
			{!isMobile && <SidebarHeader>Dashboard</SidebarHeader>}
			<SidebarContent>
				<SidebarRoutes />
			</SidebarContent>
			<div className="mt-auto">
				<ThemeSwitcher sidebarState={state} />

				<Separator className="bg-sidebar-border" />

				<NavUser />
			</div>
		</Sidebar>
	);
}
