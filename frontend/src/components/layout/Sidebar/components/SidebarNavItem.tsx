import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { useSidebar } from "../providers/SidebarProvider";

interface SidebarNavItemProps {
	href: string;
	icon?: LucideIcon;
	title: string;
	isActive?: boolean;
	onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function SidebarNavItem({
	href,
	icon: Icon,
	title,
	onClick,
}: SidebarNavItemProps) {
	const { state, isMobile } = useSidebar();
	const expanded = state === "expanded" || isMobile;

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Link
					to={href}
					onClick={onClick}
					className={cn(
						"flex items-center py-2 px-3 my-1 rounded-md text-sm font-normal transition-colors",
						"hover:bg-accent hover:text-accent-foreground",
						!expanded && "justify-center",
					)}
					activeOptions={{ exact: true }}
					activeProps={{ className: "bg-accent text-accent-foreground" }}
				>
					{Icon && <Icon className={cn("size-4", expanded && "mr-2")} />}
					{expanded && <span>{title}</span>}
				</Link>
			</TooltipTrigger>
			<TooltipContent
				side="right"
				align="center"
				hidden={state !== "collapsed" || isMobile}
			>
				{title}
			</TooltipContent>
		</Tooltip>
	);
}
