import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { type ThemeMode, useTheme } from "@/hooks/useTheme";
import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react";
import type { SidebarState } from "../layout/Sidebar/types";

interface ThemeSwitcherProps {
	sidebarState?: SidebarState;
}

export function ThemeSwitcher({
	sidebarState = "expanded",
}: ThemeSwitcherProps) {
	const { theme, setTheme } = useTheme();
	const isCollapsed = sidebarState === "collapsed";

	const ThemeIcon =
		theme === "light" ? SunIcon : theme === "dark" ? MoonIcon : LaptopIcon;

	const themeLabel =
		theme === "light" ? "Light" : theme === "dark" ? "Dark" : "System";

	const nextTheme: ThemeMode =
		theme === "light" ? "dark" : theme === "dark" ? "system" : "light";

	if (isCollapsed) {
		return (
			<div className="flex justify-center pb-2">
				<TooltipProvider>
					<Tooltip delayDuration={300}>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-9 w-9"
								onClick={() => {
									setTheme(nextTheme);
								}}
								aria-label={`Switch to ${nextTheme} mode`}
							>
								<ThemeIcon className="h-5 w-5" />
							</Button>
						</TooltipTrigger>
						<TooltipContent side="right">
							<p>Switch to {nextTheme} mode</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className="w-full py-6"
					aria-label={`Current theme: ${themeLabel}`}
				>
					<div className="flex items-start">
						<ThemeIcon className="h-4 w-4 mr-2" />
						<span className="flex-grow text-left">Appearance</span>
					</div>
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent align="end" className="w-[180px]">
				<DropdownMenuItem
					onClick={() => setTheme("light")}
					className="flex items-center gap-2"
				>
					<SunIcon className="h-4 w-4" />
					<span>Light</span>
					{theme === "light" && (
						<span className="ml-auto text-xs opacity-60">Active</span>
					)}
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={() => setTheme("dark")}
					className="flex items-center gap-2"
				>
					<MoonIcon className="h-4 w-4" />
					<span>Dark</span>
					{theme === "dark" && (
						<span className="ml-auto text-xs opacity-60">Active</span>
					)}
				</DropdownMenuItem>

				<DropdownMenuItem
					onClick={() => setTheme("system")}
					className="flex items-center gap-2"
				>
					<LaptopIcon className="h-4 w-4" />
					<span>System</span>
					{theme === "system" && (
						<span className="ml-auto text-xs opacity-60">Active</span>
					)}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
