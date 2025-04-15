import { useLocation } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { navBarSections } from "../constants";
import { SidebarNavGroup } from "./SidebarNavGroup";
import { SidebarNavItem } from "./SidebarNavItem";

type AppSection = "investing" | "spending" | "reading" | "habits" | "settings";

export function SidebarRoutes() {
	const location = useLocation();

	const shouldBeOpen = (section: AppSection): boolean => {
		return location.pathname.startsWith(`/${section}`);
	};

	return (
		<nav className="space-y-1 px-2">
			<SidebarNavGroup to="/home" icon={Home} title="Home" />
			{navBarSections.map((navBarSection) => (
				<SidebarNavGroup
					to={navBarSection.url}
					key={navBarSection.title}
					title={navBarSection.title}
					icon={navBarSection.icon}
					defaultOpen={shouldBeOpen(
						navBarSection.title.toLowerCase() as AppSection,
					)}
				>
					<SidebarNavItem
						key="overview"
						title="Overview"
						href={navBarSection.url}
					/>
					{navBarSection.items?.map((navBarItem) => (
						<SidebarNavItem
							key={navBarItem.title}
							href={navBarItem.url}
							title={navBarItem.title}
						/>
					))}
				</SidebarNavGroup>
			))}
		</nav>
	);
}
