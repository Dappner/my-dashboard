import {
	chessApi,
	dailyTimeClassStatsApiKeys,
	monthlySummaryApiKeys,
	ratingProgressionApiKeys,
} from "@/api/chessApi";
import type { Timeframe } from "@my-dashboard/shared";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function useRatingProgression(
	date: Date,
	timeframe: Timeframe = "m",
) {
	const cacheKey = format(date, "yyyy-MM-dd");

	return useQuery({
		queryKey: ratingProgressionApiKeys.byTimeframe(timeframe, cacheKey),
		queryFn: () => chessApi.getRatingProgression(date, timeframe),
	});
}

export function useTimeframeSummary(
	date: Date,
	timeframe: Timeframe = "m",
	timeClass = "all",
) {
	const cacheKey = format(date, "yyyy-MM-dd");

	return useQuery({
		queryKey: monthlySummaryApiKeys.byTimeframe(timeframe, cacheKey, timeClass),
		queryFn: () => chessApi.getTimeframeSummary(date, timeframe, timeClass),
	});
}

export function useRecentGames(
	date: Date,
	timeframe: Timeframe = "m",
	limit = 10,
) {
	const cacheKey = `${timeframe}-${format(date, "yyyy-MM-dd")}-${limit}`;

	return useQuery({
		queryKey: ["recent_games", cacheKey, limit],
		queryFn: () => chessApi.getRecentGames(date, timeframe, undefined, limit),
	});
}
export function useDailyStats(
	date: Date,
	timeframe: Timeframe,
	timeClass = "all",
) {
	const cacheKey = format(date, "yyyy-MM-dd");

	return useQuery({
		queryKey: dailyTimeClassStatsApiKeys.byTimeframe(
			timeframe,
			cacheKey,
			timeClass,
		),
		queryFn: () => chessApi.getDailyTimeClassStats(date, timeframe, timeClass),
	});
}

export function useGame(id: string) {
	return useQuery({
		queryKey: ["games", id],
		queryFn: () => chessApi.getGame(id),
		enabled: !!id,
	});
}
