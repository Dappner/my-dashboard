import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface ResponsiveHeaderProps {
	className?: string;
}

export function ResponsiveHeader({ className }: ResponsiveHeaderProps) {
	return (
		<header
			className={cn(
				"sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between border-b bg-background px-4",
				className,
			)}
		>
			{/* Left Section uses displayTitle */}
			<div className="flex min-w-0 flex-1 items-center gap-2">
				<SidebarTrigger className="-ml-1 cursor-pointer flex-shrink-0" />
				<h1 className="flex-1 truncate text-lg font-semibold sm:hidden">
					TODO
				</h1>
				<div className="hidden min-w-0 flex-1 sm:block">TODO</div>
			</div>

			{/* Right Section renders actions from context */}
			<div className="flex flex-shrink-0 items-center gap-2" />
		</header>
	);
}
