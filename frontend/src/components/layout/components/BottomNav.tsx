import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import {
	ChartNoAxesCombined,
	Clock,
	CreditCard,
	Home,
	ListChecks,
	type LucideIcon,
} from "lucide-react";

interface NavItem {
	to: string;
	icon: LucideIcon;
	label: string;
	exact?: boolean;
}

const navItems: NavItem[] = [
	{ to: "/investing", icon: ChartNoAxesCombined, label: "Investing" },
	{ to: "/spending", icon: CreditCard, label: "Spending" },
	{ to: "/home", icon: Home, label: "Home", exact: true },
	{ to: "/habits", icon: ListChecks, label: "Habits" },
	{ to: "/time-tracking", icon: Clock, label: "Time" },
];

export function BottomNav() {
	const location = useLocation();

	const isActive = (item: NavItem) => {
		if (item.exact) {
			return location.pathname === item.to;
		}
		return location.pathname.startsWith(item.to);
	};

	return (
		<div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden">
			<div className="flex justify-around items-center h-16">
				{navItems.map((item) => (
					<Link
						key={item.to}
						to={item.to}
						className={cn(
							"flex flex-col items-center justify-center w-full h-full",
							"text-muted-foreground",
							isActive(item) && "text-primary",
						)}
					>
						<item.icon className="h-5 w-5" />
						<span className="text-xs mt-1">{item.label}</span>
					</Link>
				))}
			</div>
		</div>
	);
}
