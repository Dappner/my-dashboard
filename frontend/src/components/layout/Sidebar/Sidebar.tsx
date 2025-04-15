import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useSidebar } from "./providers/SidebarProvider";

interface SidebarProps {
  children: React.ReactNode;
  className?: string;
}

export function Sidebar({ children, className }: SidebarProps) {
  const { state, isMobile, isOpen, closeSidebar } = useSidebar();

  // Handle click outside to close sidebar on mobile
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-sidebar="true"]')) {
        closeSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isOpen, closeSidebar]);

  if (isMobile) {
    return (
      <>
        {/* Mobile Overlay Sidebar */}
        <div
          data-sidebar="true"
          className={cn(
            "fixed inset-0 z-50 bg-background border-r shadow-lg transition-transform duration-300 ease-in-out transform",
            isOpen ? "translate-x-0" : "-translate-x-full",
            className,
          )}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-lg">My Dashboard</h2>
              <Button variant="ghost" size="icon" onClick={closeSidebar}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">{children}</div>
          </div>
        </div>
      </>
    );
  }

  // Desktop
  return (
    <div
      data-sidebar="true"
      data-state={state}
      className={cn(
        "h-screen sticky top-0 flex-shrink-0 border-r bg-sidebar z-30 transition-all duration-300",
        state === "expanded" ? "w-64" : "w-16",
        className,
      )}
    >
      <div className="flex flex-col h-full">{children}</div>
    </div>
  );
}
