import { supabase } from "@/lib/supabase";
import { getMonthRange } from "@/lib/utils";
import type { Database } from "@/types/supabase";

export type ChessGame = Database["chess"]["Tables"]["games"]["Row"];
export type RatingProgession =
	Database["chess"]["Views"]["rating_progression"]["Row"];
export type MonthlyActivity =
	Database["chess"]["Views"]["monthly_activity"]["Row"];
export type MonthlySummary =
	Database["chess"]["Views"]["monthly_summary"]["Row"];

export type ChessTimeClass = Database["chess"]["Enums"]["time_class"];
export type ChessColorType = Database["chess"]["Enums"]["color_type"];
export type ChessResultType = Database["chess"]["Enums"]["result_type"];

// Type for each point in the rating progression

// React Query keys for rating progression
export const ratingProgressionApiKeys = {
	all: ["rating_progression"] as const,
	month: (date: string) => [...ratingProgressionApiKeys.all, date] as const,
};

export const monthlyActivityApiKeys = {
	all: ["monthly_activity"] as const,
	month: (date: string) => [...monthlyActivityApiKeys.all, date] as const,
};

export const monthlySummaryApiKeys = {
	all: ["monthly_summary"] as const,
	month: (date: string) => [...monthlySummaryApiKeys.all, date] as const,
};

// Chess API endpoints
export const chessApi = {
	async getRatingProgression(selectedDate: Date): Promise<RatingProgession[]> {
		// compute ISO date string for 30 days ago
		const { monthStart } = getMonthRange(selectedDate);

		const { data, error } = await supabase
			.schema("chess")
			.from("rating_progression")
			.select()
			.gte("day", monthStart)

			.order("day", { ascending: true });
		if (error) throw error;
		return data ?? [];
	},

	/** number of games per day in that month */
	async getMonthlyActivity(selectedDate: Date): Promise<MonthlyActivity[]> {
		const { monthStart, monthEnd } = getMonthRange(selectedDate);
		const { data, error } = await supabase
			.schema("chess")
			.from("monthly_activity")
			.select()
			.gte("day", monthStart)
			.lte("day", monthEnd)
			.order("day", { ascending: true });
		if (error) throw error;
		return data ?? [];
	},

	/** summary stats for that month */
	async getMonthlySummary(selectedDate: Date): Promise<MonthlySummary> {
		const { monthStart } = getMonthRange(selectedDate);
		const monthStr = monthStart.slice(0, 7);
		const { data, error } = await supabase
			.schema("chess")
			.from("monthly_summary")
			.select()
			.eq("month", monthStr)
			.single();
		if (error) throw error;
		return data;
	},

	async getRecentGames(selectedDate: Date, limit = 10): Promise<ChessGame[]> {
		const { monthStart, monthEnd } = getMonthRange(selectedDate);
		const { data, error } = await supabase
			.schema("chess")
			.from("games")
			.select()
			.gte("end_time", monthStart)
			.lt("end_time", monthEnd)
			.order("end_time", { ascending: false })
			.limit(limit);

		if (error) throw error;
		return data ?? [];
	},
};
