import { supabase } from "@/lib/supabase";
import { getTimeframeRange } from "@/lib/utils";
import type { Database } from "@/types/supabase";
import type { Timeframe } from "@my-dashboard/shared";

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

export type ChessTimeframeSummary = {
	total_games: number;
	wins: number;
	win_rate_pct: number;
	avg_accuracy: number;
	total_time_spent_seconds: number;
};

// React Query keys for rating progression
export const ratingProgressionApiKeys = {
	all: ["rating_progression"] as const,
	byTimeframe: (timeframe: Timeframe, date: string) =>
		[...ratingProgressionApiKeys.all, timeframe, date] as const,
};

export const monthlyActivityApiKeys = {
	all: ["monthly_activity"] as const,
	byTimeframe: (timeframe: Timeframe, date: string) =>
		[...monthlyActivityApiKeys.all, timeframe, date] as const,
};

export const monthlySummaryApiKeys = {
	all: ["monthly_summary"] as const,
	byTimeframe: (timeframe: Timeframe, date: string) =>
		[...monthlySummaryApiKeys.all, timeframe, date] as const,
};

// Chess API endpoints
export const chessApi = {
	async getRatingProgression(
		selectedDate: Date,
		timeframe: Timeframe = "m",
		customRange?: { start: Date; end: Date },
	): Promise<RatingProgession[]> {
		const { start, end } = getTimeframeRange(
			selectedDate,
			timeframe,
			customRange,
		);

		const { data, error } = await supabase
			.schema("chess")
			.from("rating_progression")
			.select()
			.gte("day", start)
			.lte("day", end)
			.order("day", { ascending: true });

		if (error) throw error;
		return data ?? [];
	},

	/** number of games per day in that timeframe */
	async getMonthlyActivity(
		selectedDate: Date,
		timeframe: Timeframe = "m",
	): Promise<MonthlyActivity[]> {
		const { start, end } = getTimeframeRange(selectedDate, timeframe);

		const { data, error } = await supabase
			.schema("chess")
			.from("monthly_activity")
			.select()
			.gte("day", start)
			.lte("day", end)
			.order("day", { ascending: true });

		if (error) throw error;
		return data ?? [];
	},

	/** summary stats for that timeframe */
	async getMonthlySummary(
		selectedDate: Date,
		timeframe: Timeframe = "m",
		customRange?: { start: Date; end: Date },
	): Promise<ChessTimeframeSummary> {
		const { start, end } = getTimeframeRange(
			selectedDate,
			timeframe,
			customRange,
		);
		const { data, error } = await supabase
			.schema("chess")
			.rpc("summary_window", {
				p_start: start,
				p_end: end,
			})
			.single();
		if (error) throw error;

		return data as ChessTimeframeSummary;
	},

	async getRecentGames(
		selectedDate: Date,
		timeframe: Timeframe = "m",
		customRange?: { start: Date; end: Date },
		limit = 10,
	): Promise<ChessGame[]> {
		const { start, end } = getTimeframeRange(
			selectedDate,
			timeframe,
			customRange,
		);

		const { data, error } = await supabase
			.schema("chess")
			.from("games")
			.select()
			.gte("end_time", start)
			.lte("end_time", end)
			.order("end_time", { ascending: false })
			.limit(limit);

		if (error) throw error;
		return data ?? [];
	},
};
