import type React from "react";
import { createContext, useContext } from "react";
import useUser from "@/hooks/useUser";

type UserContextType = {
	displayCurrency: string;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { user } = useUser();

	// Default to USD if user preferences are still loading
	const displayCurrency = user?.preferred_currency || "USD";

	const value = {
		displayCurrency,
	};

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserPreferences = () => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useCurrency must be used within a CurrencyProvider");
	}
	return context;
};
