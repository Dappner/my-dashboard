import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSidebar } from "../providers/SidebarProvider";

interface SidebarHeaderProps {
	children?: React.ReactNode;
}

export function SidebarHeader({ children }: SidebarHeaderProps) {
	const { toggleSidebar, state, isMobile } = useSidebar();

	return (
		<div className="h-14 flex items-center px-4 border-b">
			{!isMobile && (
				<Button variant="ghost" size="icon" onClick={toggleSidebar}>
					<Menu className="h-5 w-5" />
				</Button>
			)}
			{(state === "expanded" || isMobile) && children}
		</div>
	);
}
