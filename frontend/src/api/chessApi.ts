import { supabase } from "@/lib/supabase";
import { getTimeframeRange } from "@/lib/utils";
import type { Database } from "@/types/supabase";
import type { Timeframe } from "@my-dashboard/shared";

export type ChessGame = Database["chess"]["Tables"]["games"]["Row"];
export type RatingProgession =
	Database["chess"]["Views"]["rating_progression"]["Row"];
export type MonthlyActivity =
	Database["chess"]["Views"]["monthly_activity"]["Row"];
export type DailyTimeClassStats =
	Database["chess"]["Views"]["daily_time_class_stats"]["Row"];

export type ChessTimeClass = Database["chess"]["Enums"]["time_class"];
export type ChessColorType = Database["chess"]["Enums"]["color_type"];
export type ChessResultType = Database["chess"]["Enums"]["result_type"];

export type ChessTimeframeSummary = {
	total_games: number;
	wins: number;
	losses: number;
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

export const dailyTimeClassStatsApiKeys = {
	all: ["daily_time_class_stats"] as const,
	byTimeframe: (timeframe: Timeframe, date: string, timeClass = "all") =>
		[...dailyTimeClassStatsApiKeys.all, timeframe, date, timeClass] as const,
};
export const monthlySummaryApiKeys = {
	all: ["monthly_summary"] as const,
	byTimeframe: (timeframe: Timeframe, date: string, timeClass = "all") =>
		[...monthlySummaryApiKeys.all, timeframe, date, timeClass] as const,
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
	async getDailyTimeClassStats(
		selectedDate: Date,
		timeframe: Timeframe = "m",
		timeClass = "all",
	): Promise<DailyTimeClassStats[]> {
		const { start, end } = getTimeframeRange(selectedDate, timeframe);

		// build the base query
		let qb = supabase
			.schema("chess")
			.from("daily_time_class_stats")
			.select()
			.gte("day", start)
			.lte("day", end);

		// if not “all”, filter to that class
		if (timeClass !== "all") {
			qb = qb.eq("category", timeClass);
		}

		const { data, error } = await qb.order("day", { ascending: true });
		if (error) throw error;
		return data ?? [];
	},
	/** summary stats for that timeframe */
	async getTimeframeSummary(
		selectedDate: Date,
		timeframe: Timeframe = "m",
		timeClass = "all",
	): Promise<ChessTimeframeSummary> {
		const { start, end } = getTimeframeRange(selectedDate, timeframe);

		const { data, error } = await supabase
			.schema("chess")
			.rpc("get_timeframe_summary", {
				p_start: start,
				p_end: end,
				p_time_class: timeClass,
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
