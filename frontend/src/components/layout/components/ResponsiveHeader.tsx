import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTransactionSheet } from "@/contexts/SheetContext";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import React from "react";
import { Link, type RouteObject, useMatches } from "react-router-dom";

interface AppRouteHandle {
	crumb?: (data?: any) => React.ReactNode;
	title?: string;
}

// Type guard to check handle structure
function hasCrumbOrTitle(handle: unknown): handle is AppRouteHandle {
	if (!handle || typeof handle !== "object") {
		return false;
	}
	return "crumb" in handle || "title" in handle;
}

// Helper to get crumb content
const getCrumbContent = (
	match: RouteObject & { handle?: AppRouteHandle },
	data?: any,
	params?: any,
): React.ReactNode => {
	const { handle } = match;
	if (handle?.crumb && typeof handle.crumb === "function") {
		try {
			return handle.crumb({ data, params });
		} catch (e) {
			console.error("Error generating crumb:", e, match);
			return handle.title ?? null;
		}
	}
	return handle?.title ?? null;
};

interface ResponsiveHeaderProps {
	className?: string;
}

export function ResponsiveHeader({ className }: ResponsiveHeaderProps) {
	const matches = useMatches();

	const { openAddTransaction } = useTransactionSheet();

	const lastMatch = matches.length > 0 ? matches[matches.length - 1] : null;
	const routeHandle = lastMatch?.handle as AppRouteHandle | undefined;
	const routeHandleTitle = routeHandle?.title;

	const displayTitle = routeHandleTitle ?? " ";

	const showButton = location.pathname.includes("/transactions");

	const onClick = () => {
		if (location.pathname.includes("/transactions")) {
			openAddTransaction();
		}
	};

	const crumbs = React.useMemo(() => {
		return matches
			.filter((match): match is RouteObject & { handle: AppRouteHandle } =>
				hasCrumbOrTitle(match.handle),
			)
			.map((match, index, arr) => {
				const crumbContent = getCrumbContent(match, match.data, match.params);
				if (!crumbContent) return null;

				const isLast = index === arr.length - 1;

				return (
					<React.Fragment key={match.id || match.pathname}>
						<BreadcrumbItem>
							{isLast ? (
								<BreadcrumbPage>{displayTitle}</BreadcrumbPage>
							) : (
								<BreadcrumbLink asChild>
									<Link to={match.pathname}>{crumbContent}</Link>
								</BreadcrumbLink>
							)}
						</BreadcrumbItem>
						{!isLast && <BreadcrumbSeparator />}
					</React.Fragment>
				);
			})
			.filter(Boolean);
	}, [matches]);

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
					{displayTitle}
				</h1>
				<div className="hidden min-w-0 flex-1 sm:block">
					{crumbs.length > 1 ? (
						<Breadcrumb>
							<BreadcrumbList>{crumbs}</BreadcrumbList>
						</Breadcrumb>
					) : (
						<h1 className="truncate text-lg font-semibold">{displayTitle}</h1>
					)}
				</div>
			</div>

			{/* Right Section renders actions from context */}
			<div className="flex flex-shrink-0 items-center gap-2">
				{showButton && (
					<Button variant="outline" onClick={onClick}>
						<Plus />
					</Button>
				)}
			</div>
		</header>
	);
}
