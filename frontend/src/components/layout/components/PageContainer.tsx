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
				"mx-auto p-0 pt-2 sm:p-4 md:p-6 lg:p-8 space-y-4",
				"pb-[calc(1.5rem+72px)] sm:pb-4 md:pb-6",
				className,
			)}
		>
			{children}
		</div>
	);
}
