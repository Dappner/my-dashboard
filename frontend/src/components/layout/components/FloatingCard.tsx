import * as React from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

function FloatingCard({
  className,
  children,
  ...props
}: React.ComponentProps<"main">) {
  const { state } = useSidebar();

  return (
    <main
      data-slot="floating-main"
      data-state={state}
      className={cn(
        // Base styles
        "relative flex-1 flex flex-col",
        // Background and borders
        "bg-sidebar rounded-xl border shadow-sm",
        // Sizing and spacing
        "m-2 p-4 overflow-auto max-w-full",
        // Transitions
        "transition-all duration-200 ease-linear",
        // Responsive adjustments for sidebar states
        "data-[state=collapsed]:mx-2",
        "data-[state=expanded]:ml-2 md:data-[state=expanded]:ml-4",
        className
      )}
      {...props}
    >
      {children}
    </main>
  );
}

export { FloatingCard };
