import useUser from "@/hooks/useUser";
import type { User } from "@/types/userTypes";
import type React from "react";
import { createContext, useContext, useMemo } from "react";

type UserContextType = {
	currentUser?: User | null;
	isLoading: boolean;
	displayCurrency: string;
	formatCurrency: (amount: number, options?: { compact?: boolean }) => string;
	getCurrencySymbol: (currencyCode?: string) => string;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const currencySymbols: Record<string, string> = {
	USD: "$",
	EUR: "€",
	GBP: "£",
	JPY: "¥",
	CAD: "C$",
	AUD: "A$",
	CNY: "¥",
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { user, isLoading } = useUser();

	const displayCurrency = user?.preferred_currency || "USD";

	// Get currency symbol for a given currency code
	const getCurrencySymbol = (currencyCode?: string): string => {
		const code = currencyCode || displayCurrency;
		return currencySymbols[code] || "$";
	};

	// Format currency with proper symbol and format
	const formatCurrency = (
		amount: number,
		options?: { compact?: boolean },
	): string => {
		const symbol = getCurrencySymbol();

		if (options?.compact) {
			if (Math.abs(amount) >= 1e9) {
				return `${symbol}${(amount / 1e9).toFixed(1)}B`;
			}
			if (Math.abs(amount) >= 1e6) {
				return `${symbol}${(amount / 1e6).toFixed(1)}M`;
			}
			if (Math.abs(amount) >= 1e3) {
				return `${symbol}${(amount / 1e3).toFixed(1)}K`;
			}
		}

		// Standard formatting
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: displayCurrency,
			maximumFractionDigits: 2,
		}).format(amount);
	};

	// TODO: ?
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const value = useMemo(
		() => ({
			currentUser: user,
			isLoading,
			displayCurrency,
			formatCurrency,
			getCurrencySymbol,
		}),
		[user, isLoading, displayCurrency],
	);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserPreferences = () => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUserPreferences must be used within a UserProvider");
	}
	return context;
};
