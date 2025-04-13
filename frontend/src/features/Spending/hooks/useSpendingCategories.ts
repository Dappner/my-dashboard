import {
	spendingCategoriesApi,
	spendingCategoriesApiKeys,
} from "@/api/spendingCategoriesApi";
import { useQuery } from "@tanstack/react-query";

export interface UseSpendingCategoriesOptions {
	enabled?: boolean;
}
export function useSpendingCategories(
	_options: UseSpendingCategoriesOptions = {},
) {
	return useQuery({
		initialData: [],
		queryKey: spendingCategoriesApiKeys.all,
		queryFn: spendingCategoriesApi.getCategories,
	});
}
