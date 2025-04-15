"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import useUser from "@/hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from "lucide-react";
import { useSidebar } from "../Sidebar/providers/SidebarProvider";

export function NavUser() {
	const { isMobile, state } = useSidebar();
	const queryClient = useQueryClient();
	const { signOut } = useAuth();
	const { user } = useUser();

	const signOutAndInvalidate = () => {
		queryClient.invalidateQueries();
		signOut();
	};

	if (!user) return;

	const fullName = `${user.first_name || ""} ${user.last_name || ""}`;
	const initials =
		(user.first_name || "N").charAt(0) + user.last_name?.charAt(0);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="w-full justify-between px-3 py-8">
					<div className="flex items-center">
						<Avatar className="h-8 w-8 rounded-lg">
							<AvatarImage alt={fullName} />
							<AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
						</Avatar>

						{(state === "expanded" || isMobile) && (
							<div className="ml-2 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{fullName}</span>
								<span className="truncate text-xs block">{user.email}</span>
							</div>
						)}
					</div>

					{(state === "expanded" || isMobile) && (
						<ChevronsUpDown className="ml-auto size-4" />
					)}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg mb-2"
				side={isMobile ? "bottom" : "right"}
				align="end"
				sideOffset={4}
			>
				<DropdownMenuLabel className="p-0 font-normal">
					<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar className="h-8 w-8 rounded-lg">
							<AvatarImage alt={fullName} />
							<AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">{fullName}</span>
							<span className="truncate text-xs">{user.email}</span>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem className="cursor-pointer">
						<BadgeCheck />
						Account
					</DropdownMenuItem>
					<DropdownMenuItem className="cursor-pointer">
						<Bell />
						Notifications
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={signOutAndInvalidate}
					className="cursor-pointer"
				>
					<LogOut />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
