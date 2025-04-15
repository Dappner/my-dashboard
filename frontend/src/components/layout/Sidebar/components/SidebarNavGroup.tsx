import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { useSidebar } from "../providers/SidebarProvider";

interface SidebarNavGroupProps {
	title: string;
	icon?: LucideIcon;
	children?: React.ReactNode;
	defaultOpen?: boolean;
	to?: string; // Optional direct link for the group itself
}

export function SidebarNavGroup({
	title,
	icon: Icon,
	children,
	defaultOpen,
	to,
}: SidebarNavGroupProps) {
	const { state, isMobile } = useSidebar();
	const expanded = state === "expanded" || isMobile;
	const [isOpen, setIsOpen] = useState(defaultOpen);

	const standalone = !children;
	// If sidebar is collapsed on desktop, just show icon
	if (!expanded && !isMobile) {
		return (
			<div className="px-2">
				{Icon && (
					<Link
						to={to}
						activeOptions={{
							exact: true,
						}}
						activeProps={{
							className: "!text-foreground bg-accent rounded-md",
						}}
						className="flex justify-center py-2 text-muted-foreground hover:text-foreground cursor-pointer"
						title={title}
					>
						<Icon className="h-5 w-5" />
					</Link>
				)}
			</div>
		);
	}

	if (standalone) {
		return (
			<Link
				to={to}
				className={cn(
					"flex items-center justify-between py-2 px-3 rounded-md cursor-pointer",
					"hover:bg-accent hover:text-accent-foreground",
					"text-sm font-medium",
				)}
			>
				<div className="flex items-center">
					{Icon && <Icon className="size-4 mr-2" />}
					<span>{title}</span>
				</div>
			</Link>
		);
	}

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<Tooltip>
				<TooltipTrigger asChild>
					<CollapsibleTrigger asChild>
						<div
							className={cn(
								"flex items-center justify-between py-2 px-3 rounded-md cursor-pointer",
								"hover:bg-accent hover:text-accent-foreground",
								"text-sm font-medium",
							)}
						>
							<div className="flex items-center">
								{Icon && <Icon className="size-4 mr-2" />}
								<span>{title}</span>
							</div>
							<ChevronRight
								className={cn(
									"h-4 w-4 transition-transform",
									isOpen && "rotate-90",
								)}
							/>
						</div>
					</CollapsibleTrigger>
				</TooltipTrigger>
				<TooltipContent
					side="right"
					align="center"
					hidden={state !== "collapsed" || isMobile}
				>
					{title}
				</TooltipContent>
			</Tooltip>
			<CollapsibleContent>
				<div className="pl-4">{children}</div>
			</CollapsibleContent>
		</Collapsible>
	);
}
