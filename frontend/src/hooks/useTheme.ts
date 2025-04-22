import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

export function useTheme() {
	// 1) Init from localStorage or default to "system"
	const [theme, setTheme] = useState<ThemeMode>(() => {
		// If we're not in browser context (e.g., during SSR), return default
		if (typeof window === "undefined") return "system";

		const saved = localStorage.getItem("theme") as ThemeMode | null;
		return saved ?? "system";
	});

	// 2) Whenever `theme` changes, update <html> class and localStorage
	useEffect(() => {
		const root = document.documentElement;

		// helper to apply a concrete mode
		const apply = (m: "light" | "dark") => {
			root.classList[m === "dark" ? "add" : "remove"]("dark");
		};

		if (theme === "system") {
			// apply current system and listen for changes
			const mq = window.matchMedia("(prefers-color-scheme: dark)");
			apply(mq.matches ? "dark" : "light");
			const handler = (e: MediaQueryListEvent) =>
				apply(e.matches ? "dark" : "light");
			mq.addEventListener("change", handler);
			// cleanup listener if user switches away from "system"
			return () => mq.removeEventListener("change", handler);
		}

		apply(theme);
	}, [theme]);

	// 3) persist
	useEffect(() => {
		localStorage.setItem("theme", theme);
	}, [theme]);

	// 4) cycle: light → dark → system → light
	const toggleTheme = () =>
		setTheme((prev) =>
			prev === "light" ? "dark" : prev === "dark" ? "system" : "light",
		);

	// 5) setter to pick directly
	const setThemeMode = (mode: ThemeMode) => {
		setTheme(mode);
	};

	return {
		theme,
		isLight: theme === "light",
		isDark: theme === "dark",
		isSystem: theme === "system",
		toggleTheme,
		setTheme: setThemeMode,
	};
}
