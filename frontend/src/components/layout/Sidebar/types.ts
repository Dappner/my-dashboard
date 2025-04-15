import type { LucideIcon } from "lucide-react";

export type SidebarState = "expanded" | "collapsed";

export interface SidebarContextProps {
	state: SidebarState;
	isMobile: boolean;
	isOpen: boolean;
	toggleSidebar: () => void;
	closeSidebar: () => void;
	openSidebar: () => void;
}

export interface NavBarSection {
	title: string;
	url: string;
	rootName?: string;
	icon?: LucideIcon;
	isActive?: boolean;
	items?: {
		title: string;
		url: string;
	}[];
}
