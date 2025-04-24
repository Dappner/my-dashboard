import { spendingApi, spendingApiKeys } from "@/api/spending/spendingApi";
import { useQuery } from "@tanstack/react-query";

export interface UseSpendingCategoriesOptions {
	enabled?: boolean;
}
export function useSpendingCategories(
	_options: UseSpendingCategoriesOptions = {},
) {
	return useQuery({
		initialData: [],
		queryKey: spendingApiKeys.categoryList(),
		queryFn: spendingApi.fetchCategoriesList,
	});
}
