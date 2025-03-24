import { Timeframe } from "@/types/portfolioDailyMetricTypes";

interface DateRange {
  startDate: string | null;
  endDate?: string;
}

export function getDateRangeFilter(timeframe: Timeframe): DateRange {
  const now = new Date();

  switch (timeframe) {
    case "1W": {
      const oneWeekAgo = new Date(now.setDate(now.getDate() - 7)).toISOString();
      return { startDate: oneWeekAgo };
    }
    case "1M": {
      const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1))
        .toISOString();
      return { startDate: oneMonthAgo };
    }
    case "3M": {
      const threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3))
        .toISOString();
      return { startDate: threeMonthsAgo };
    }
    case "YTD": {
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
      return { startDate: yearStart };
    }
    case "1Y": {
      const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1))
        .toISOString();
      return { startDate: oneYearAgo };
    }
    case "ALL":
      return { startDate: null };
    default:
      throw new Error(`Unsupported timeframe: ${timeframe}`);
  }
}
