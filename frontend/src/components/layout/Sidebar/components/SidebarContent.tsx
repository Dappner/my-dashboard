interface SidebarContentProps {
	children: React.ReactNode;
}

export function SidebarContent({ children }: SidebarContentProps) {
	return <div className="flex-1 overflow-y-auto py-2">{children}</div>;
}
