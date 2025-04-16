import { userApi, userApiKeys } from "@/api/usersApi";
import {
	CURRENCY_SYMBOLS,
	type SupportedCurrency,
	formatCurrencyValue,
} from "@/lib/currencyUtils";
import type { UpdateUser, User } from "@/types/userTypes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useMemo } from "react";
import { useAuth } from "./AuthContext";

interface UserContextType {
	currentUser: User | null;
	isLoading: boolean;
	// biome-ignore lint/suspicious/noExplicitAny: TODO: Improve
	updateUserProfile: (data: Partial<UpdateUser>) => Promise<any>;

	// Currency and formatting utilities
	displayCurrency: SupportedCurrency;
	formatCurrency: (
		amount: number,
		options?: { compact?: boolean; decimals?: number },
	) => string;
	getCurrencySymbol: (currencyCode?: SupportedCurrency) => string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { userId, isAuthenticated } = useAuth();
	const queryClient = useQueryClient();

	// Only fetch user data when we have a userId
	const { data: currentUser, isLoading } = useQuery({
		queryKey: userApiKeys.all,
		queryFn: () => userApi.getUser(userId || undefined),
		enabled: !!userId && isAuthenticated,
	});

	// Update user profile mutation
	const updateUserMutation = useMutation({
		mutationFn: userApi.updateUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userApiKeys.all });
		},
	});

	// Wrap updateUser to make it more convenient
	const updateUserProfile = async (data: Partial<UpdateUser>) => {
		if (!userId || !currentUser) {
			throw new Error("Cannot update user profile: User not authenticated");
		}

		return updateUserMutation.mutateAsync({
			id: userId,
			...data,
		});
	};

	// Currency and formatting utilities
	const displayCurrency =
		(currentUser?.preferred_currency as SupportedCurrency) || "USD";

	const getCurrencySymbol = (currencyCode?: SupportedCurrency): string => {
		const code = currencyCode || displayCurrency;
		return CURRENCY_SYMBOLS[code] || "$";
	};

	const formatCurrency = (
		amount: number,
		options?: { compact?: boolean; decimals?: number },
	): string => {
		return formatCurrencyValue(amount, displayCurrency, options);
	};

	// Create context value
	// biome-ignore lint/correctness/useExhaustiveDependencies: IDGAF
	const value = useMemo(
		() => ({
			currentUser: currentUser || null,
			isLoading,
			updateUserProfile,
			displayCurrency,
			formatCurrency,
			getCurrencySymbol,
		}),
		[currentUser, isLoading, updateUserMutation.isPending, displayCurrency],
	);

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error("useUser must be used within a UserProvider");
	}
	return context;
};
