import { Outlet, useNavigate } from "@tanstack/react-router";
import { useAuthContext } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { loginRoute } from "@/routes";
import LoadingSpinner from "@/components/layout/components/LoadingSpinner";

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
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return <Outlet />;
}

export default AuthWrapper;
