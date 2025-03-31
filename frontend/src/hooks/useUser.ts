import { userApi, userApiKeys } from "@/api/usersApi";
import { useAuthContext } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function useUser() {
	const queryClient = useQueryClient();
	const { user: authUser } = useAuthContext();
	const { data: user, isLoading } = useQuery({
		queryFn: () => userApi.getUser(authUser!.id),
		queryKey: userApiKeys.all,
		enabled: !!authUser,
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
