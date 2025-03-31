import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
	BookOpen,
	ChartNoAxesCombined,
	ChevronRight,
	CreditCard,
	Home,
	type LucideIcon,
	Settings2Icon,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";

type NavBarItem = {
	title: string;
	url: string;
	rootName?: string;
	icon?: LucideIcon;
	isActive?: boolean;
	items?: {
		title: string;
		url: string;
	}[];
};

const navBarItems: NavBarItem[] = [
	{
		title: "Investing",
		url: "/investing",
		rootName: "Overview",
		icon: ChartNoAxesCombined,
		items: [
			{
				title: "Holdings",
				url: "/investing/holdings",
			},
			{
				title: "Transactions",
				url: "/investing/transactions",
			},
			{
				title: "Research",
				url: "/investing/research",
			},
			{
				title: "Manage",
				url: "/investing/manage",
			},
		],
	},
	{
		title: "Spending",
		url: "/spending",
		rootName: "Overview",
		icon: CreditCard,
		items: [
			{
				title: "Receipts",
				url: "/spending/receipts",
			},
		],
	},
	{
		title: "Literature",
		url: "/literature",
		icon: BookOpen,
		rootName: "Overview",
		items: [
			{
				title: "Introduction",
				url: "#",
			},
			{
				title: "Get Started",
				url: "#",
			},
			{
				title: "Tutorials",
				url: "#",
			},
			{
				title: "Changelog",
				url: "#",
			},
		],
	},
	{
		title: "Settings",
		url: "/settings",
		rootName: "General",
		icon: Settings2Icon,
	},
];

export function NavMain() {
	const navigate = useNavigate();
	const location = useLocation();
	const { open } = useSidebar();

	// Handler for icon clicks in collapsed mode
	const handleClick = (e: MouseEvent, url: string) => {
		if (!open) {
			e.preventDefault();
			e.stopPropagation();
			navigate(url);
		}
	};

	const isCurrentUrl = (url: string) => {
		return location.pathname === url;
	};

	return (
		<SidebarGroup>
			<SidebarGroupLabel>Platform</SidebarGroupLabel>
			<SidebarMenu>
				<SidebarMenuItem key={"Home"}>
					<SidebarMenuButton
						className={
							location.pathname == "/"
								? "bg-gray-200 rounded-md hover:bg-gray-200"
								: ""
						}
						asChild
					>
						<Link to={"/"}>
							<Home className="size-5" />
							<span>Home</span>
						</Link>
					</SidebarMenuButton>
				</SidebarMenuItem>
				{navBarItems.map((item) => (
					<Collapsible
						key={item.title}
						asChild
						defaultOpen={item.isActive}
						className="group/collapsible"
					>
						<SidebarMenuItem>
							<CollapsibleTrigger asChild>
								<SidebarMenuButton
									tooltip={item.title}
									onClick={(e) => handleClick(e, item.url)}
								>
									{item.icon && (
										<span
											className={cn(
												"relative",
												!open && "cursor-pointer hover:text-primary",
											)}
										>
											<item.icon className="size-5" />
										</span>
									)}
									<span>{item.title}</span>
									<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
								</SidebarMenuButton>
							</CollapsibleTrigger>
							<CollapsibleContent>
								<SidebarMenuSub>
									{/* Add the main section as the first item in the dropdown */}
									<SidebarMenuSubItem key={`${item.title}-main`}>
										<SidebarMenuSubButton
											className={
												isCurrentUrl(item.url)
													? "bg-gray-200 hover:bg-gray-200"
													: ""
											}
											asChild
										>
											<Link to={item.url}>
												<span>{item.rootName}</span>
											</Link>
										</SidebarMenuSubButton>
									</SidebarMenuSubItem>

									{/* Original subitems */}
									{item.items?.map((subItem) => (
										<SidebarMenuSubItem key={subItem.title}>
											<SidebarMenuSubButton
												className={
													isCurrentUrl(subItem.url)
														? "bg-gray-200 hover:bg-gray-200 "
														: ""
												}
												asChild
											>
												<Link to={subItem.url}>
													<span>{subItem.title}</span>
												</Link>
											</SidebarMenuSubButton>
										</SidebarMenuSubItem>
									))}
								</SidebarMenuSub>
							</CollapsibleContent>
						</SidebarMenuItem>
					</Collapsible>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}
