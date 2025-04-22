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
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from "lucide-react";
import { useSidebar } from "../Sidebar/providers/SidebarProvider";

export function NavUser() {
	const { isMobile, state } = useSidebar();
	const queryClient = useQueryClient();
	const { signOut } = useAuth();
	const { currentUser: user } = useUser();

	const signOutAndInvalidate = () => {
		queryClient.invalidateQueries();
		signOut();
	};

	if (!user) return;

	const fullName = `${user.first_name || ""} ${user.last_name || ""}`;
	const initials =
		(user.first_name || "N").charAt(0) + user.last_name?.charAt(0);

	if (isMobile) {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="rounded-full">
						<Avatar className="size-10">
							<AvatarImage alt={fullName} />
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className="min-w-56 rounded-lg"
					side="bottom"
					align="end"
					sideOffset={4}
				>
					<DropdownMenuLabel className="p-0 font-normal">
						<div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
							<Avatar className="h-8 w-8 rounded-lg">
								<AvatarImage alt={fullName} />
								<AvatarFallback className="rounded-lg">
									{initials}
								</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{fullName}</span>
								<span className="truncate text-xs">{user.email}</span>
							</div>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<DropdownMenuItem asChild>
							<Link to="/account" className="cursor-pointer">
								<BadgeCheck className="mr-2 h-4 w-4" />
								Account
							</Link>
						</DropdownMenuItem>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={signOutAndInvalidate}
						className="cursor-pointer"
					>
						<LogOut className="mr-2 h-4 w-4" />
						Log out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="w-full px-2 py-8">
					<div className="flex items-center">
						<Avatar className="size-10 rounded-lg">
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

					{/* {(state === "expanded" || isMobile) && ( */}
					{/* 	<ChevronsUpDown className="ml-auto size-4" /> */}
					{/* )} */}
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
					<DropdownMenuItem asChild>
						<Link to="/account" className="cursor-pointer">
							<BadgeCheck className="mr-2 h-4 w-4" />
							Account
						</Link>
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
