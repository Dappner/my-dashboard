import LoadingState from "@/components/layout/components/LoadingState";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export default function AuthWrapper() {
	const { isLoading: authLoading, isAuthenticated, session } = useAuth();
	const { isLoading: userLoading, currentUser } = useUser();
	const navigate = useNavigate();
	const location = useLocation();
	const isLoginPage = location.pathname === "/login";

	// Combine loading states from both auth and user contexts
	const isLoading = authLoading || (isAuthenticated && userLoading);

	// Full authentication requires both auth session and loaded user data
	const isFullyAuthenticated = isAuthenticated && !!currentUser;

	useEffect(() => {
		// Only redirect when all loading is complete
		if (!isLoading) {
			if (!session && !isLoginPage) {
				// Not authenticated and not on login page - redirect to login
				navigate({ to: "/login", replace: true });
			} else if (isFullyAuthenticated && isLoginPage) {
				// Fully authenticated but on login page - redirect to home
				navigate({ to: "/home", replace: true });
			}
		}
	}, [isLoading, session, isFullyAuthenticated, isLoginPage, navigate]);

	// Show loading state while authentication is being determined or user data is loading
	if (isLoading) {
		return <LoadingState />;
	}

	// Render outlet only if:
	// 1. On login page and not authenticated, or
	// 2. Fully authenticated (auth + user data) and not on login page
	if (
		(isLoginPage && !isAuthenticated) ||
		(isFullyAuthenticated && !isLoginPage)
	) {
		return <Outlet />;
	}

	// Render a blank page during redirection
	return <LoadingState />;
}
