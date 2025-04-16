import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface AuthContextType {
	session: Session | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	userId: string | null;
	// biome-ignore lint/suspicious/noExplicitAny: TODO: Improve
	signIn: (email: string, password: string) => Promise<any>;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const queryClient = useQueryClient();

	// Authentication effect - runs once on mount
	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
			setIsLoading(false);
		});

		// Set up auth listener
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			setIsLoading(false);
		});

		return () => subscription.unsubscribe();
	}, []);

	// Authentication methods
	const signIn = async (email: string, password: string) => {
		setIsLoading(true);
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			return { data, error };
		} finally {
			setIsLoading(false);
		}
	};

	const signOut = async () => {
		setIsLoading(true);
		try {
			await supabase.auth.signOut();
			queryClient.clear(); // Clear all query cache on logout
		} finally {
			setIsLoading(false);
		}
	};

	const userId = useMemo(() => session?.user?.id || null, [session]);
	const isAuthenticated = !!session?.user?.id;

	// biome-ignore lint/correctness/useExhaustiveDependencies: I think it's fine
	const value = useMemo(
		() => ({
			session,
			isLoading,
			isAuthenticated,
			userId,
			signIn,
			signOut,
		}),
		[session, isLoading, isAuthenticated, userId],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};
