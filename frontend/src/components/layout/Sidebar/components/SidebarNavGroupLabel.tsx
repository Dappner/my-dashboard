import { useSidebar } from "../providers/SidebarProvider";

export function SidebarNavGroupLabel({
  children,
}: { children: React.ReactNode }) {
  const { state, isMobile } = useSidebar();

  if (state === "collapsed" && !isMobile) {
    return null;
  }

  return (
    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      {children}
    </div>
  );
}
