import LoadingState from "@/components/layout/components/LoadingState";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { useLatestForexRates } from "@/hooks/useLatestForexRates";
import { Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { Button } from "../ui/button";

export default function AuthWrapper() {
	const { isLoading: authLoading, isAuthenticated, session } = useAuth();
	const { isLoading: userLoading, currentUser } = useUser();
	const { isLoading: ratesLoading, error: ratesError } = useLatestForexRates();
	const navigate = useNavigate();
	const location = useLocation();

	const isLoginPage = location.pathname === "/login";

	// Determine if rates are needed based on the current route
	const isRatesNeededRoute = useMemo(() => {
		// Routes that need currency conversion
		const currencyRoutes = ["/spending", "/investing"];

		// Check if the current route starts with any of the currency routes
		return currencyRoutes.some((route) => location.pathname.startsWith(route));
	}, [location.pathname]);

	// Combine loading states from auth, user, and rates contexts
	const isLoading =
		authLoading ||
		(isAuthenticated && userLoading) ||
		(isAuthenticated && isRatesNeededRoute && ratesLoading);

	// Full authentication requires both auth session and loaded user data
	const isFullyAuthenticated = isAuthenticated && !!currentUser;

	// Get appropriate loading message

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

	// Show error if rates failed to load for routes that need them
	if (ratesError && isRatesNeededRoute && isFullyAuthenticated) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
					<h2 className="text-xl font-semibold text-red-700 mb-2">
						Currency Data Error
					</h2>
					<p className="text-red-600 mb-4">
						There was a problem loading currency exchange rates:{" "}
						{ratesError.message}
					</p>
					<Button
						onClick={() => window.location.reload()}
						variant="destructive"
					>
						Retry
					</Button>
				</div>
			</div>
		);
	}

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
