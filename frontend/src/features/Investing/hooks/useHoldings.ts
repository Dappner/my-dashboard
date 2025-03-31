import { holdingsApi, holdingsApiKeys } from "@/api/holdingsApi";
import { useQuery } from "@tanstack/react-query";

export const useHoldings = () => {
	const {
		data: holdings,
		isLoading,
		isError,
	} = useQuery({
		queryFn: holdingsApi.getHoldings,
		queryKey: holdingsApiKeys.all,
	});

	return {
		holdings,
		isLoading,
		isError,
	};
};
