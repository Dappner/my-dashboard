import { Menu } from "lucide-react";
import { useSidebar } from "../providers/SidebarProvider";
import { Button } from "@/components/ui/button";

export function SidebarTrigger() {
  const { openSidebar } = useSidebar();

  return (
    <Button variant="ghost" size="icon" onClick={openSidebar}>
      <Menu className="h-5 w-5" />
    </Button>
  );
}
