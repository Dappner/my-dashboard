import { supabase } from "@/lib/supabase";
import type { AuthError, Session } from "@supabase/supabase-js";
import { useState } from "react";

export function useAuth() {
	const [isLoading, setIsLoading] = useState(false);
	const [session, setSession] = useState<Session | null>(null);

	const signIn = async (email: string, password: string) => {
		setIsLoading(true);
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (data?.session) {
				setSession(data.session);
			}

			setIsLoading(false);
			return { data, error };
		} catch (error) {
			setIsLoading(false);
			return {
				data: null,
				error: error as AuthError,
			};
		}
	};

	const signOut = async () => {
		setIsLoading(true);
		const { error } = await supabase.auth.signOut();
		setSession(null);
		setIsLoading(false);
		return { error };
	};

	return {
		isLoading,
		session,
		signIn,
		signOut,
	};
}
