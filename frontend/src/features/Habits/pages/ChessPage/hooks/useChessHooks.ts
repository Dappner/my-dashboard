import {
  chessApi,
  monthlyActivityApiKeys,
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
  // Create a cache key that includes both timeframe and date
  const cacheKey = `${timeframe}-${format(date, "yyyy-MM-dd")}`;

  return useQuery({
    queryKey: ratingProgressionApiKeys.byTimeframe(timeframe, cacheKey),
    queryFn: () => chessApi.getRatingProgression(date, timeframe),
  });
}
export function useMonthlyActivity(date: Date, timeframe: Timeframe = "m") {
  const cacheKey = `${timeframe}-${format(date, "yyyy-MM-dd")}`;

  return useQuery({
    queryKey: monthlyActivityApiKeys.byTimeframe(timeframe, cacheKey),
    queryFn: () => chessApi.getMonthlyActivity(date, timeframe),
  });
}

export function useMonthlySummary(
  date: Date,
  timeframe: Timeframe = "m",
  customRange?: { start: Date; end: Date },
) {
  const rangeKey = customRange
    ? `${format(customRange.start, "yyyy-MM-dd")}-${format(customRange.end, "yyyy-MM-dd")}`
    : "";
  const cacheKey = `${timeframe}-${format(date, "yyyy-MM-dd")}-${rangeKey}`;

  return useQuery({
    queryKey: monthlySummaryApiKeys.byTimeframe(timeframe, cacheKey),
    queryFn: () => chessApi.getMonthlySummary(date, timeframe),
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
