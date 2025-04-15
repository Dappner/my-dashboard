import { useAuthContext } from "@/contexts/AuthContext";
import { loginRoute } from "@/routes";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

function AuthWrapper() {
	const { user, isLoading } = useAuthContext();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && !user) {
			navigate({
				to: loginRoute.to,
				replace: true,
			});
		}
	}, [isLoading, user, navigate]);

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center bg-gray-50 justify-center" />
		);
	}

	return <Outlet />;
}

export default AuthWrapper;
