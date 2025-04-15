import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useSidebar } from "../providers/SidebarProvider";

export function SidebarTrigger() {
	const { openSidebar } = useSidebar();

	return (
		<Button variant="ghost" size="icon" onClick={openSidebar}>
			<Menu className="h-5 w-5" />
		</Button>
	);
}
