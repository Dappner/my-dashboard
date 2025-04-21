import { Button } from "@/components/ui/button";
import { type ThemeMode, useTheme } from "@/hooks/useTheme";
import { LaptopIcon, MoonIcon, SunIcon } from "lucide-react";

export function ThemeSwitcher() {
	const { theme, toggleTheme } = useTheme();

	// compute the *next* mode for your aria-label
	const next: ThemeMode =
		theme === "light" ? "dark" : theme === "dark" ? "system" : "light";

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			aria-label={`Switch to ${next} mode`}
		>
			{theme === "light" && <MoonIcon className="h-5 w-5" />}
			{theme === "dark" && <SunIcon className="h-5 w-5" />}
			{theme === "system" && <LaptopIcon className="h-5 w-5" />}
		</Button>
	);
}
