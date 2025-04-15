import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useSidebar } from "../providers/SidebarProvider";

interface SidebarHeaderProps {
	children?: React.ReactNode;
}

export function SidebarHeader({ children }: SidebarHeaderProps) {
	const { toggleSidebar, state, isMobile } = useSidebar();

	return (
		<div className="h-14 flex items-center justify-between px-4 border-b">
			{(state === "expanded" || isMobile) && children}
			{!isMobile && (
				<Button variant="ghost" size="icon" onClick={toggleSidebar}>
					<ChevronRight
						className={`size-5 transition-transform duration-300 ${
							state === "expanded" ? "rotate-180" : "rotate-0"
						}`}
					/>
				</Button>
			)}
		</div>
	);
}
