import { userApi, userApiKeys } from "@/api/usersApi";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function useUser() {
	const queryClient = useQueryClient();
	const { userId } = useAuth();
	const { data: user, isLoading } = useQuery({
		queryFn: () => userApi.getUser(userId || undefined),
		queryKey: userApiKeys.all,
		enabled: !!userId,
	});

	const updateUserMutation = useMutation({
		mutationFn: userApi.updateUser,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userApiKeys.all });
		},
	});

	return {
		user,
		updateUser: updateUserMutation.mutate,
		isLoading,
	};
}
