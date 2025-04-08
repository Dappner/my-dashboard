import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function PageContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto ",
        "p-0 pt-2 sm:p-4 md:p-6 lg:p-8",
        "pb-[calc(1.5rem+72px)] sm:pb-4 md:pb-6",
        "space-y-2 sm:space-y-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
