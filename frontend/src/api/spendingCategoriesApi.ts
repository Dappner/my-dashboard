import { supabase } from "@/lib/supabase";
import type { Database } from "@my-dashboard/shared";

export type SpendingCategory =
	Database["grocery"]["Tables"]["categories"]["Row"];

export const spendingCategoriesApiKeys = {
	all: ["spendingCategories"] as const,
};

export const spendingCategoriesApi = {
	async getCategories(): Promise<SpendingCategory[]> {
		const { data, error } = await supabase
			.schema("grocery")
			.from("categories")
			.select();

		if (error) {
			throw new Error(`Error fetching spending categories: ${error.message}`);
		}

		return data as SpendingCategory[];
	},
};
